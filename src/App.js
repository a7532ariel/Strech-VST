import React, { useState, useEffect } from 'react';

import axios from 'axios';
import './App.css';

import Select, { createFilter } from "react-select";
import Slider from './components/Slider';
import MenuList from './components/MenuList';
import Img from './components/Img';

import { Typography, Container, Grid, AppBar, Toolbar, TextField, Card, CardContent, CardMedia, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Icon from "@material-ui/core/Icon";


const useStyles = makeStyles((theme) => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6, 0, 1),
  },
  heroButtons: {
    marginTop: theme.spacing(3),
  },
  gridItem: {
    margin: "auto",
    marginTop: theme.spacing(0),
    marginLeft: theme.spacing(2),
  },
   gridSearch: {
    margin: "auto",
    marginTop: theme.spacing(0),
    marginRight: theme.spacing(1),
    
  },
  gridWord: {
    marginLeft: theme.spacing(7),
    marginTop: theme.spacing(2),
  },
  searchIcon: {
    fontSize: 100
  },
  iconContainer: {
    marginLeft: theme.spacing(1)
  },
  searchContainer: {
    height: '100%',
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'auto',
    width: '70%'
  },
  card: {
    width: '250px',
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: "0 4px 25px -11px rgba(0,0,0,0.3)",
    '&:hover': {
        boxShadow: "0 16px 40px -12.125px rgba(0,0,0,0.3)"
    },
  },
  cardMedia: {
    width: '100%',
    paddingTop: '75%', // 16:9
  },
  cardContent: {
    flexGrow: 1
  },
  gridList: {
      flexWrap: 'nowrap',
      textAlign: 'left',
  }  ,
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8),
    paddingBottom: theme.spacing(4),
  },
  customBox: {
    display: "-webkit-box",
    boxOrient: "vertical",
    lineClamp: 2,
    wordBreak: "break-all",
    overflow: "hidden",
  },
  sliderContainer: {
    marginTop: theme.spacing(3),
  },
  sliderHint: {
    marginBottom: '-5px',
  },
  storyContainer: {
    marginTop: theme.spacing(1),
  }
}));


function App() {
  const classes = useStyles();

  const apiURL = 'https://doraemon.iis.sinica.edu.tw/acldemo'

  const [storyId, setStoryId] = useState('')
  const [storyIdList, setStoryList] = useState([])
  const [storyLength, setStoryLength] = useState(0)
  const [suggestStoryLength, setSuggestStoryLength] = useState(0)
  const [availableStoryLength, setAvailableStoryLength] = useState([])
  const [imageIds, setimageIds] = useState([])
  const [storyText, setStoryText] = useState('')
  const [storyKeyWord, setStoryKeyWord] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [searchState, setSearchState] = useState('idle')

  const resetState = () => {
    setStoryText('')
    setStoryId('')
    setSuggestStoryLength(0)
    setStoryLength(0)
    setAvailableStoryLength([])
    setimageIds([])
  }

  useEffect(() => {
      async function fetchStoryIDs() {
        const result = await axios(`${apiURL}/story_ids`);
        const options = result.data.map(storyid => {
          return {
            value: storyid,
            label: storyid
          }
        })
        setStoryList(options)
      }
      fetchStoryIDs()
    }, [])

  const onSelectStoryId = async (value) => {
    setStoryId(value)
    setSearchState('idle')
    const result = await axios(`${apiURL}/select_story_id?story_id=${value}`);
    const image_srcs = result.data.image_ids.map(image_id => { return `https://doraemon.iis.sinica.edu.tw/vist_image/all_images/${image_id}.jpg` })
    setimageIds(image_srcs)
    setSuggestStoryLength(result.data.suggest_len)    
    setStoryLength(result.data.suggest_len)    
    setStoryText(result.data.suggest_story)    
    setAvailableStoryLength(result.data.available_lens)    
  }

  const onChangeStoryLength = (value) => {
    const storyLen = availableStoryLength[value]
    setStoryLength(storyLen)
  }
  const onChangeStoryLengthComplete = async () => {
    const result = await axios(`${apiURL}/select_story_length?story_id=${storyId}&story_len=${storyLength}`);
    setStoryText(result.data.predicted_story)
  }

  const handleTextFieldChange = (e) => {
    setStoryKeyWord(e.target.value)
  }

  const onEnter = async (e) => {
    if (e.keyCode == 13) {
      await onSearch()
    }
  }

  const onSearch = async () => {
    resetState()
    setSearchState('pending')
    const result = await axios.post(`${apiURL}/search_story`, storyKeyWord, {
      headers: { 'Content-Type': 'text/plain' }
    });
    if (result.data.length === 0) {
      setSearchState('fail')
    } else {
      setSearchState('success')
      setSearchResult(result.data.map(
        item => {
          return {
            ...item,
            'image': `https://doraemon.iis.sinica.edu.tw/vist_image/all_images/${item['image']}.jpg`
          }
        }
      ))
    }
  }

  return (
    <div className="App">
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            Visual Story Generator
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.heroContent}>
        <Container maxWidth="md">
          <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
            Visual Story Generator
          </Typography>
          <Typography variant="h5" align="center" color="textSecondary" paragraph>
            Welcome to Stretch-VIST! You can...
          </Typography>
        </Container>
        <Container >
          <div className={classes.heroButtons}>
            <Grid container  spacing={2} justify="center"  >
              <Grid item xs={5}>
                {
                  storyIdList.length !== 0 && 
                  <div className="select-container">
                    <Select
                      className="select"
                      defaultValue={storyId}
                      onChange={(selected) => {setSearchResult([]); onSelectStoryId(selected['value'])}}
                      options={storyIdList}
                      filterOption={createFilter({ ignoreAccents: false })}
                      components={{ MenuList }}
                      placeholder={"View Stretch-VIST generated stories"}
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                        ...theme.colors,
                          text: '#3f51b5',
                          primary: '#3f51b5',
                        },
                      })}
                    />
                  </div>
                }
              </Grid>
              <Grid item container xs={1} className={classes.gridWord} justify="center" alignItems="center">
                <div style={{height: '100%'}}>
                  <Typography variant="body1" align="center" color="textSecondary">
                    OR
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={5} className={classes.gridSearch}>
                <Grid container className="searchContainer" alignItems="center">
                  <Grid item xs={10}> 
                    <TextField
                      id="outlined-secondary"
                      label="Search for Stretch-VIST generated stories"
                      variant="outlined"
                      // helperText=""
                      fullWidth={true}
                      onChange={handleTextFieldChange}
                      onKeyDown={onEnter}
                    />
                  </Grid>
                  <Grid item onClick={onSearch} className={classes.iconContainer}> 
                   <Icon className="MuiIcon-colorPrimary" style={{ fontSize: 35 }}>search</Icon>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </Container>
      </div>
      {
        searchState !== 'idle' &&
        <Container className={classes.cardGrid} maxWidth="lg">
          {
            searchState === 'fail' && 
            <Typography variant="body1" align="center" color="textSecondary">
              Sorry:( No results found. Change your query and search again!
            </Typography>
          }
          {
            searchState === 'success' && 
            <Grid container spacing={4} className={classes.gridList}>
              {searchResult.map((card) => (
                <Grid item key={card}>
                  <Card className={classes.card} onClick={()=>onSelectStoryId(card.story_id)}>
                    <CardMedia
                      className={classes.cardMedia}
                      image={card.image}
                      title="Image title"
                    />
                    <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h6" component="h3">
                        {`Story ${card.story_id}`}
                      </Typography>
                      <Box
                        fontWeight="fontWeightLight"
                        fontSize={15}
                        component="div"
                        classes={{root: classes.customBox}}
                      >
                        {card.story}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          }
          {
            searchState === 'pending' && 
            <Typography variant="body1" align="center" color="textSecondary">
              Searching...
            </Typography>
          }
        </Container>
      }
      {
        imageIds.length !== 0 &&
        <Img srcs={imageIds} />
      }
      {
        availableStoryLength.length > 1 && 
        <Container className={classes.sliderContainer} maxWidth="sm">
          <Typography gutterBottom className={classes.sliderHint} color="textSecondary">
            Drag the bar to adjust the length of the story!
          </Typography>
          <Slider
            max={availableStoryLength.length-1}
            min={0}
            label={value => {
              if (availableStoryLength[value] === suggestStoryLength)
                return `${availableStoryLength[value]} (Recommended!)`
              else return availableStoryLength[value]
            }}
            value={availableStoryLength.findIndex(elem => elem === storyLength)}
            onChange={onChangeStoryLength}
            onChangeComplete={onChangeStoryLengthComplete} />
        </Container>
      }
      {
        storyText !== '' && 
        <Container className={classes.storyContainer} maxWidth="md">
          <Typography component="div">
            <Box lineHeight={1.5} m={1} textAlign="left" fontWeight={500} fontSize={26}> 
              Generated Story
            </Box>
            <Box lineHeight={1.4} m={1} textAlign="left"fontWeight="fontWeightLight" fontSize={20}> 
            {storyText}
            </Box>
          </Typography>
        </Container>
      }
      {/* Footer */}
      <footer className={classes.footer}>
        <Typography variant="h6" align="center" gutterBottom>
          <Box  fontWeight={400}>
          Stretch-VST
          </Box>
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
          Getting Flexible With Visual Stories
        </Typography>
      </footer>
      {/* End footer */}
    </div>
  );
}

export default App;
