import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Header } from "./Ui/Header";
import { Dice } from "./Scene/Dice";
import { ThrowHint } from "./Ui/Hints/ThrowHint";
import { PickHint } from "./Ui/Hints/PickHint";
import { PullHint } from "./Ui/Hints/PullHint";
import { isDiceValue, isScoreSheetEmpty } from "../gameRules/types";
import { Overlay } from "./Ui/Overlay";
import { ScoreSheet } from "./Ui/ScoreSheet/ScoreSheet";
import { ScaleOnPulse } from "./Scene/ScaleOnPulse";
import { SelectedDiceHint } from "./Scene/SelectedDiceHint";
import { useDelay } from "./Ui/useDelay";
import { Target } from "./Scene/Target";
import { createGameWorld } from "../game/state";
import {
  Game as IGame,
  getStatus,
  isBlank,
  isRolling,
  nReroll,
} from "../gameRules/game";

export const Game_ = ({
  UiPortal,
}: {
  UiPortal: (props: { children: any }) => null;
}) => {
  const world = React.useMemo(createGameWorld, []);

  const [dragging, setDragging] = React.useState(false);
  const [scoresheetOpen, setScoresheetOpen] = React.useState(false);

  useEventListeners({
    onRelease() {
      setDragging(false);
      if (world.state.game.roll.some(isBlank)) world.releaseRollPush();
      else world.releasePickingPull();
    },
    onDragHorizontally(v) {
      setDragging(true);
      if (world.state.game.roll.some(isBlank)) world.setRollPush(v);
      else world.setPickingPull(v);
    },
  });

  const refGroupDice = React.useRef<THREE.Group>(null);
  const refGroupHint = React.useRef<THREE.Group>(null);
  const [, rerenderOnChange] = React.useState(world.state.game);

  useFrame(({ camera }, dt) => {
    world.setCamera(camera.position, camera.quaternion);
    world.step(dt);
    rerenderOnChange(world.state.game); // to trigger a re-render when game change

    refGroupDice.current?.children.forEach((c, i) => {
      world.getPosition(i, c);
      refGroupHint.current?.children[i].position.copy(c.position);
    });
  });

  return (
    <>
      <group ref={refGroupDice}>
        {world.state.game.roll.map((_, i) => (
          <ScaleOnPulse
            key={i}
            pulse={
              (world.state.game.pickedDice[i] &&
                world.state.game.roll[i] !== "blank" &&
                "selected") ||
              (world.state.game.roll.every(isDiceValue) && "rolled")
            }
          >
            <Dice
              onClick={(e: Event) => {
                e.stopPropagation();
                world.toggleDicePicked(i);
              }}
            />
          </ScaleOnPulse>
        ))}
      </group>

      <group ref={refGroupHint}>
        {world.state.game.roll.map((_, i) => (
          <SelectedDiceHint
            key={i}
            selected={
              !dragging &&
              world.state.game.pickedDice[i] &&
              !world.state.game.roll.some(isBlank)
            }
          />
        ))}
      </group>

      <Target />

      <UiPortal>
        <Header
          key="header"
          remainingRerolls={world.state.game.remainingReRoll}
          diceRoll={world.state.game.roll}
          onToggleDicePicked={world.toggleDicePicked}
        />

        {!dragging && !scoresheetOpen && <Hint game={world.state.game} />}

        {scoresheetOpen && (
          <Overlay>
            <ScoreSheet
              style={{ width: "calc( 100% - 40px )", maxWidth: "600px" }}
              scoreSheet={world.state.game.scoreSheet}
              onClose={() => setScoresheetOpen(false)}
              onSelectCategory={
                world.state.game.roll.every(isDiceValue)
                  ? (c) => {
                      world.selectCategoryForDiceRoll(c);
                      setScoresheetOpen(false);
                    }
                  : undefined
              }
              rollCandidate={
                world.state.game.roll.every(isDiceValue)
                  ? world.state.game.roll
                  : undefined
              }
            />
          </Overlay>
        )}

        {!scoresheetOpen && (
          <button
            style={{
              position: "absolute",
              width: "160px",
              height: "40px",
              bottom: "10px",
              right: "60px",
              zIndex: 1,
            }}
            onClick={() => setScoresheetOpen(true)}
          >
            score sheet
          </button>
        )}
      </UiPortal>
    </>
  );
};

const Hint = ({ game }: { game: IGame }) => {
  const hint = useDelay(getHint(game), 2500);
  if (hint === "pick") return <PickHint />;
  if (hint === "throw") return <ThrowHint />;
  if (hint === "pull") return <PullHint />;
  return null;
};
const getHint = (game: IGame) => {
  if (game.remainingReRoll < nReroll || !isScoreSheetEmpty(game.scoreSheet))
    return null;
  if (game.roll.some(isBlank)) return "throw";
  if (game.roll.every(isDiceValue)) {
    if (Object.values(game.pickedDice).some(Boolean)) return "pull";
    else return "pick";
  }
  return null;
};

const useEventListeners = ({
  onDragHorizontally,
  onRelease,
}: {
  onDragHorizontally: (y: number) => void;
  onRelease: () => void;
}) => {
  const {
    gl: { domElement },
  } = useThree();
  React.useEffect(() => {
    let anchor: { y: number } | null = null;
    const onDown = ({ y }: PointerEvent) => {
      anchor = { y };
    };
    const onMove = ({ y }: PointerEvent) => {
      if (!anchor) return;
      const delta = y - anchor.y;
      if (Math.abs(delta) > 20)
        onDragHorizontally(delta / domElement.clientHeight);
    };
    const onUp = () => {
      anchor = null;
      onRelease();
    };

    domElement.addEventListener("pointerdown", onDown);
    domElement.addEventListener("pointermove", onMove);
    domElement.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onUp);

    return () => {
      domElement.removeEventListener("pointerdown", onDown);
      domElement.removeEventListener("pointermove", onMove);
      domElement.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onUp);
    };
  }, [domElement]);
};

export const Game = React.memo(Game_);
