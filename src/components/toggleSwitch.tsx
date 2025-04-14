import './toggleSwitch.css';

export const ToggleSwitch = () => {
    return (
        <label className="switch" >
            <input type="checkbox" />
            <span className="slider" />
        </label>
    );
}
