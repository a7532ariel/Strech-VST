import InputRange from 'react-input-range';

import 'react-input-range/lib/css/index.css';
import "./css/Slider.css"

function Slider(props) {
    const { min, max, value, label, onChange, onChangeComplete } = props;

    return (
        <div className="slider-container">
            <div className="slider">
                <label>{label}</label>
                <InputRange
                    formatLabel={label}
                    minValue={min}
                    maxValue={max}
                    step={1}
                    onChange={onChange}
                    value={value}
                    onChangeComplete={onChangeComplete}
                />
            </div>
        </div>
    );
}


export default Slider;