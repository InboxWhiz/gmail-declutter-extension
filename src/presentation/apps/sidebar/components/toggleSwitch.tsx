import "./toggle.css";

interface ToggleSwitchProps {
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const ToggleSwitch = ({
  defaultChecked,
  onChange,
}: ToggleSwitchProps) => {
  return (
    <label className="switch">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        onChange={(e) => onChange && onChange(e.target.checked)}
      />
      <span className="slider" />
    </label>
  );
};
