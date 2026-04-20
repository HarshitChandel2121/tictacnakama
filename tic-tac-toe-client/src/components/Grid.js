import { gridStyles } from "../styles/components"

export function Grid({ cellList = [], defaultStyle=gridStyles.cell }) {
  return (
    <div style={gridStyles.grid}>
      {cellList.map((cell, index) => {
        const key = cell?.key ?? index;
        const onClick = cell?.onClick ?? undefined;
        const style = cell?.style ?? defaultStyle;
        const content = cell?.content ?? "";

        return (
          <button
            key={key}
            onClick={onClick}
            style={style}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}