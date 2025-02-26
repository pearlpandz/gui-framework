import React, { useState } from "react";

// Utils
import Dropdown from "../../dropdown";

// Styles
import styles from "./recordperPage.module.scss";

interface RecordsPerPageProps {
  options: number[];
  onRowChange: (data: number) => void;
  [key: string]: any; // Allow additional props to be passed (e.g., className, id)
}


function RecordsPerPage(props:RecordsPerPageProps) {
  const { onRowChange, options = [] } = props;
  const [value , setValue] = useState<number>(options[0])
  
  return (
    <div className={styles.record_per_page_container}>
      <p className={styles.show}>Show</p>
      <Dropdown
        value={value}
        onChange={(event:React.ChangeEvent<HTMLLIElement>, item:number) => {
          event.preventDefault();
          event.stopPropagation();
          onRowChange(item);
          setValue(item)
        }}
        options={options}
        filter={false}
        className={styles.recorder_per_page_dropdown}
      />
    </div>
  );
}

export default RecordsPerPage;
