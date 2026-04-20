// components/BackButton.js
import { nav } from "../styles/layout";

export default function BackButton({ onClick, disabled }) {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      style={{
        ...nav.backButton,
        ...(disabled ? nav.disabled : {})
      }}
    >
      ⬅
    </button>
  );
}