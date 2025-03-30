import React, {
  Fragment,
  ReactNode,
  useEffect,
  useState,
} from "react";

// Utils
import Button from "../button";

// Styles
import styles from "./modal.module.scss";

// Assets
import close from "../assets/close.svg";
import maximize from "../assets/maximize.svg";

interface ModalProps {
  header?: string | ReactNode;
  footer?: string | ReactNode;
  visible: boolean;
  noScroll?: boolean;
  onHide: () => void;
  size?: string;
  className?: string;
  position?: string;
  resize?: boolean;
  maximizable?: boolean;
  draggable?: boolean;
  children?: ReactNode;
  [key: string]: any; // Allow additional props to be passed (e.g., className, id)
}

interface statePositions {
  x: string | number;
  y: string | number;
}

interface stateOffset {
  x: number;
  y: number;
}

interface stateDimensions {
  width: string | number;
  height: string | number;
}

function Modal(props: ModalProps) {
  const {
    header,
    footer,
    visible = false,
    noScroll = false,
    onHide,
    size = "default",
    className = "",
    position = "center",
    resize = false,
    maximizable = false,
    draggable = false,
    children,
    ...others
  } = props;

  const body = document.getElementsByTagName("BODY")[0] as HTMLElement;
  const [offset, setOffset] = useState<stateOffset>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<stateDimensions>({
    width: "",
    height: "",
  });
  const [storedDimensions, setStoredDimensions] = useState<stateDimensions>({
    width: "",
    height: "",
  });
  const [positions, setPositions] = useState<statePositions>({
    x: "",
    y: "",
  });
  const [storedPositions, setStoredPositions] = useState<statePositions>({
    x: "",
    y: "",
  });

  // If scroll is not needed for whole application if an modal is open
  // For that using this useEffect (noscroll will be an boolean props)
  useEffect(() => {
    if (noScroll === true && visible === true) {
      body.style.overflow = "hidden";
    }
    return () => {
      body.style.overflow = "auto";
    };
  }, [body, noScroll, size, visible]);

  // For handling resizing of modal
  const handleMouseDown = (e: any) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = e.target.parentElement?.offsetWidth || 0;
    const startHeight = e.target.parentElement?.offsetHeight || 0;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(startWidth + (e.clientX - startX), 240);
      const newHeight = Math.max(startHeight + (e.clientY - startY), 240);
      setDimensions({ width: newWidth, height: newHeight });
      setStoredDimensions({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // For handling mazimizing of modal and return back to previous state using an button
  const maximizeModal = () => {
    if (dimensions.width == "100%") {
      setDimensions({
        width: storedDimensions.width,
        height: storedDimensions.height,
      });
      setPositions({ x: storedPositions.x, y: storedPositions.y });
    } else {
      setDimensions({ width: "100%", height: "100%" });
      setPositions({ x: 0, y: 0 });
    }
  };

  // Handling moving of modal
  const handleModalDown = (event: any) => {
    if (!draggable) return;
    if (dimensions.width !== 100) {
      event.preventDefault();
      const element = event.target.parentNode;
      const rect = element.getBoundingClientRect();

      setOffset({
        x: event.pageX - rect.left,
        y: event.pageY - rect.top,
      });

      const handleModalMove = (event: MouseEvent) => {
        let _positions = {
          x: Math.max(event.pageX - offset.x),
          y: Math.max(event.pageY - offset.y),
        };
        setPositions(_positions);
        setStoredPositions(_positions);
      };

      const handleModalMouseUp = () => {
        document.removeEventListener("mousemove", handleModalMove);
        document.removeEventListener("mouseup", handleModalMouseUp);
      };

      document.addEventListener("mousemove", handleModalMove);
      document.addEventListener("mouseup", handleModalMouseUp);
    }
  };

  return (
    <Fragment>
      {visible && (
        <div className={`${styles.modal} ${className}`}>
          <div
            className={`${styles[size]} ${styles.modal_container} ${styles[position]}`}
            {...others}
            style={{
              width: dimensions.width,
              height: dimensions.height,
              top: positions.y,
              left: positions.x,
            }}
          >
            {header && typeof header === "string" ? (
              <div
                className={styles.modal_header}
                style={{
                  cursor: draggable ? "move" : "default",
                  borderRadius: dimensions?.height === "100" ? "unset" : "",
                }}
                onMouseDown={handleModalDown}
              >
                <div className={styles.modal_header_title}>
                  {header || "Header"}
                </div>
                <div className={styles.action_section}>
                  {maximizable && (
                    <Button
                      icon={maximize}
                      onClick={maximizeModal}
                      className={styles.close}
                    />
                  )}
                  <Button
                    style={{ backgroundColor: "#EEE7E7" }}
                    icon={close}
                    onClick={onHide}
                    className={styles.close}
                  />
                </div>
              </div>
            ) : header && typeof header !== "string" ? (
              <div
                className={styles.modal_header}
                onMouseDown={handleModalDown}
              >
                <span style={{ width: "90%" }}>{header}</span>
                <Button
                  style={{ backgroundColor: "#EEE7E7" }}
                  icon={close}
                  onClick={onHide}
                  className={styles.close}
                />
              </div>
            ) : (
              <Fragment></Fragment>
            )}
            <div
              style={{
                borderRadius: !header && !footer ? "6px" : "",
                borderTopLeftRadius: !header ? "6px" : "",
                borderTopRightRadius: !header ? "6px" : "",
                borderBottomLeftRadius: !footer ? "6px" : "",
                borderBottomRightRadius: !footer ? "6px" : "",
              }}
              className={styles.modal_content}
            >
              {children}
            </div>
            {footer && <div className={styles.modal_footer}>{footer}</div>}
            {resize && (
              <div
                onMouseDown={handleMouseDown}
                className={styles.resize}
              ></div>
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default Modal;
