import * as CANNON from "cannon-es";
import { DiceValue } from "./types";

/**
 * get the value of the face of the dice facing up
 * ( for this specific glb model )
 */
export const getDiceUpFace = (q: CANNON.Quaternion) => {
  q_.copy(q).inverse().vmult(CANNON.Vec3.UNIT_Y, up);

  let value: DiceValue = 1;
  let d = 0;

  if (up.x > d) {
    d = up.x;
    value = 2;
  }
  if (-up.x > d) {
    d = -up.x;
    value = 5;
  }
  if (up.y > d) {
    d = up.y;
    value = 1;
  }
  if (-up.y > d) {
    d = -up.y;
    value = 6;
  }
  if (up.z > d) {
    d = up.z;
    value = 4;
  }
  if (-up.z > d) {
    d = -up.z;
    value = 3;
  }
  return value;
};

const q_ = new CANNON.Quaternion();
const up = new CANNON.Vec3(0, 1, 0);
