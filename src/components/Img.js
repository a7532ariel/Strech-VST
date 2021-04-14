import './css/Img.css';


function Img(props) {
    const { srcs } = props;
    const imgs = srcs.map((src, index) =>
      <img src={src} key={index} /> 
    );

    return (
        <div className="img-container">
            <div className="imgs">
                {imgs}
            </div>
        </div>
    );
}

export default Img;
