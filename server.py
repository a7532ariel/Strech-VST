import json
from functools import lru_cache
import random
from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
import subprocess

from elasticsearch import Elasticsearch, helpers

es = Elasticsearch(HOST="http://localhost", PORT=9200)
INDEX = 'storytest'

app = Flask(__name__, static_folder="build/static", template_folder="build")
CORS(app)

@lru_cache
def load_story_len_mapping() -> dict:
    with open('./story_len_mapping.json', 'r') as f:
        story_len_mapping = json.load(f)
    return story_len_mapping

@lru_cache
def load_suggest_len() -> dict:
    with open('/home/EthanHsu/commen-sense-storytelling/system/length_recommendation/length_recommendation_TransLSTM1.5_vist_scored_terms_best_path.5term.newobj.json', 'r') as f:
        suggest_len_mapping = json.load(f)
    return suggest_len_mapping

@lru_cache()
def load_image_ids() -> dict:
    with open('/home/EthanHsu/commen-sense-storytelling/system/data/5images_story_id2images.json', 'r') as f:
        story_id2images = json.load(f)
    return story_id2images

@lru_cache()
def load_story(story_id, length):
    path = f"/home/EthanHsu/commen-sense-storytelling/system/stories/5images/TransLSTM1.5_vist_scored_terms_{length}_path.5term.newobj.json"
    with open(path, 'r') as f:
        stories = json.load(f)
    for story in stories:
        if story['story_id'] == story_id:
            return story['predicted_story']

@app.route('/')
def hello_world():
    return "Hello, World! For Camel Flask Server"

@app.route("/index.html")
def home():
    return render_template('index.html')

@app.route('/search_story', methods=['POST'])
def search_story() -> list:
    app.logger.debug(f'search text: {request.data.decode()}')
    text = request.data.decode()

    res = es.search(index=INDEX, size=10, body={"query": {"match": {"predicted_story": text}}})
    print("Got %d Hits:" % len(res['hits']['hits']))
    
    story_id_image_ids_mapping = load_image_ids()
    results = []
    seen = set()
    for item in res['hits']['hits']:
        hit = item["_source"]

        story_id = hit['story_id']
        if story_id in seen: continue
        else: seen.add(story_id)

        image_ids = story_id_image_ids_mapping[story_id]
        story = hit['predicted_story']

        results.append({
            'image': random.choice(image_ids),
            'story': story,
            'story_id': story_id
        })
           
    return jsonify(results)

@app.route("/story_ids")
def get_story_ids():
    story_len_mapping = load_story_len_mapping()
    story_ids = list(story_len_mapping.keys())
    return jsonify(story_ids)

@app.route('/select_story_id')
def select_story_id() -> dict:
    story_id = request.args.get('story_id')

    story_id_image_ids_mapping = load_image_ids()
    story_id_suggest_len_mapping = load_suggest_len()
    story_len_mapping = load_story_len_mapping()

    image_ids = story_id_image_ids_mapping[story_id]
    available_lens = story_len_mapping[story_id]
    suggest_len = story_id_suggest_len_mapping[story_id]

    suggest_story = load_story(story_id, suggest_len)
    return jsonify({
        'image_ids': image_ids, 
        'suggest_len': suggest_len, 
        'available_lens': available_lens,
        'suggest_story': suggest_story
    })

@app.route('/select_story_length')
def select_story_length() -> dict:
    story_id = request.args.get('story_id')
    story_len = request.args.get('story_len')

    predicted_story = load_story(story_id, story_len)
    return jsonify({
        'predicted_story': predicted_story
    })


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=12345)