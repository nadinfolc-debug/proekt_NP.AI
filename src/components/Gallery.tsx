import { useEffect, useId, useRef, useState } from "react";
import type { ImageMedia } from "../data/projects";
import { Picture } from "./Media";

export function Gallery({ images }: { images: ImageMedia[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const labelId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setActive(null);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active === null) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
  }, [active]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (event: KeyboardEvent) => {
      if (!dialog.open || active === null) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive((value) => (value === null ? value : (value + 1) % images.length));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive((value) =>
          value === null ? value : (value - 1 + images.length) % images.length,
        );
      }
    };
    dialog.addEventListener("keydown", onKey);
    return () => dialog.removeEventListener("keydown", onKey);
  }, [active, images.length]);

  const current = active === null ? images[0] : images[active];

  return (
    <>
      <ul className="gallery">
        {images.map((image, index) => (
          <li key={image.jpg}>
            <button type="button" onClick={() => setActive(index)}>
              <Picture image={image} />
              <span className="visually-hidden">Увеличить: {image.alt}</span>
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-labelledby={labelId}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        {current ? (
          <div className="lightbox-inner">
            <div className="lightbox-bar">
              <p id={labelId}>
                {active === null ? 1 : active + 1} / {images.length}
                <span className="visually-hidden">. Стрелки влево и вправо переключают кадр.</span>
              </p>
              <button ref={closeRef} type="button" onClick={() => dialogRef.current?.close()}>
                Закрыть
              </button>
            </div>
            <Picture image={current} priority />
            <p>{current.alt}</p>
            {images.length > 1 ? (
              <div className="lightbox-nav">
                <button
                  type="button"
                  onClick={() =>
                    setActive((value) =>
                      value === null ? 0 : (value - 1 + images.length) % images.length,
                    )
                  }
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActive((value) => (value === null ? 0 : (value + 1) % images.length))
                  }
                >
                  Дальше
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
