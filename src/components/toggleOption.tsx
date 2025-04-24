import { ToggleSwitch } from "./toggleSwitch";

export const ToggleOption = ({
  label,
  defaultChecked,
  onChange,
}: {
  label: string | React.ReactElement;
  defaultChecked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <div className="toggle-option">
      <ToggleSwitch defaultChecked={defaultChecked} onChange={onChange} />
      <p className="label">{label}</p>
    </div>
  );
};
