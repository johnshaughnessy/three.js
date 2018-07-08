///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Util?
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function logMatrix(m) {
  for (var i = 0; i < 16; i++) {
    console.log(m.elements[i]);
  }
}
function equals(a, b, epsilon) {
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (Math.abs(a[i] - b[i]) > epsilon) {
        return false;
      }
    }
    return true;
  }
  return a === b;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Raw Device Input
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let RightOculusTouchGamepad = null;

function GetRightOculusTouchGamepad() {
  const gamepads = navigator.getGamepads();
  for (var i = 0; i < gamepads.length; i++) {
    const gamepad = gamepads[i];
    if (gamepad.id === "Oculus Touch (Right)") {
      return gamepad;
    }
  }
  return null;
}

const RightOculusTouchInputFrame = {
  a_touch: false,
  a: false,
  b_touch: false,
  b: false,
  stick_touch: false,
  stick: false,
  trigger_touch: false,
  grip_touch: false,
  face_touch: false,
  stick_up_down: 0,
  stick_left_right: 0,
  trigger: 0,
  grip: 0,
  position: [0, 0, 0],
  orientation: [0, 0, 0, 0],
  linearVelocity: [0, 0, 0],
  linearAcceleration: [0, 0, 0],
  angularVelocity: [0, 0, 0],
  angularAcceleration: [0, 0, 0]
};
const RightOculusTouchInputFrame2 = {
  a_touch: false,
  a: false,
  b_touch: false,
  b: false,
  stick_touch: false,
  stick: false,
  trigger_touch: false,
  grip_touch: false,
  face_touch: false,
  stick_up_down: 0,
  stick_left_right: 0,
  trigger: 0,
  grip: 0,
  position: [0, 0, 0],
  orientation: [0, 0, 0, 0],
  linearVelocity: [0, 0, 0],
  linearAcceleration: [0, 0, 0],
  angularVelocity: [0, 0, 0],
  angularAcceleration: [0, 0, 0]
};

const evenInputFrame = {
  curr: RightOculusTouchInputFrame,
  prev: RightOculusTouchInputFrame2
};

const oddInputFrame = {
  curr: RightOculusTouchInputFrame2,
  prev: RightOculusTouchInputFrame
};

const RightOculusTouchSourceNames = [
  "a_touch",
  "a",
  "b_touch",
  "b",
  "stick_touch",
  "stick",
  "trigger_touch",
  "grip_touch",
  "stick_up_down",
  "stick_left_right",
  "trigger",
  "grip",
  "face_touch",
  "position",
  "orientation",
  "linearVelocity",
  "linearAcceleration",
  "angularVelocity",
  "angularAcceleration"
];

function poll_RightOculusTouchInput(gamepad, frame) {
  const axes = gamepad.axes;
  const buttons = gamepad.buttons;
  const pose = gamepad.pose;
  frame.stick_touch = buttons[0].touched;
  frame.stick = buttons[0].pressed;
  frame.stick_left_right = axes[0];
  frame.stick_up_down = axes[1];
  frame.trigger = buttons[1].value;
  frame.trigger_touch = buttons[1].touched;
  frame.a = buttons[3].pressed; // WRONG - NOT BUTTON 3?
  frame.a_touch = buttons[3].touched;
  frame.b = buttons[4].pressed;
  frame.b_touch = buttons[4].touched;
  frame.grip_touch = buttons[2].touched;
  frame.grip = buttons[2].value;
  frame.face_touch = buttons[5].touched;
  frame.hasPosition = pose.hasPosition;
  frame.hasOrientation = pose.hasOrientation;
  if (pose.hasPosition && pose.position !== null) {
    frame.position[0] = pose.position[0];
    frame.position[1] = pose.position[1];
    frame.position[2] = pose.position[2];
    frame.linearVelocity[0] = pose.linearVelocity[0];
    frame.linearVelocity[1] = pose.linearVelocity[1];
    frame.linearVelocity[2] = pose.linearVelocity[2];
    frame.linearAcceleration[0] = pose.linearAcceleration[0];
    frame.linearAcceleration[1] = pose.linearAcceleration[1];
    frame.linearAcceleration[2] = pose.linearAcceleration[2];
  }
  if (pose.hasOrientation && pose.orientation !== null) {
    frame.orientation[0] = pose.orientation[0];
    frame.orientation[1] = pose.orientation[1];
    frame.orientation[2] = pose.orientation[2];
    frame.orientation[3] = pose.orientation[3];
    frame.angularVelocity[0] = pose.angularVelocity[0];
    frame.angularVelocity[1] = pose.angularVelocity[1];
    frame.angularVelocity[2] = pose.angularVelocity[2];
    frame.angularAcceleration[0] = pose.angularAcceleration[0];
    frame.angularAcceleration[1] = pose.angularAcceleration[1];
    frame.angularAcceleration[2] = pose.angularAcceleration[2];
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Actions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const actionDefinition = {
  actions: [
    {
      name: "/cursor_in_right_hand/in/cursor_position",
      type: "vector3"
    },
    {
      name: "/cursor_in_right_hand/in/cursor_orientation",
      type: "quaternion"
    },
    {
      name: "/cursor_in_right_hand/in/interact",
      type: "boolean"
    }
  ]
};

const bindingDefinition = {
  bindings: [
    {
      source: "/devices/right_oculus_touch/position",
      destination: "/cursor_in_right_hand/in/cursor_position"
    },
    {
      source: "/devices/right_oculus_touch/orientation",
      destination: "/cursor_in_right_hand/in/cursor_orientation"
    },
    {
      source: "/devices/right_oculus_touch/b",
      destination: "/cursor_in_right_hand/in/interact"
    }
  ]
};

let Input = {};
function bind(actionDefinition, bindingDefinition) {
  const actionSetNames = _.uniq(
    _.map(actionDefinition.actions, action =>
      action.name.slice(1, 1 + _.indexOf(action.name.substring(1), "/"))
    )
  );

  Input = _.object(
    actionSetNames,
    _.map(actionSetNames, setName => {
      const relevantActions = _.filter(
        actionDefinition.actions,
        action => action.name.includes(setName) && action.name.includes("/in/")
      );
      const simpleNames = _.map(relevantActions, action => {
        return action.name.substring(
          "/in/".length + action.name.indexOf("/in/")
        );
      });

      const types = _.map(relevantActions, action => {
        const matchingBinding = _.filter(
          bindingDefinition.bindings,
          binding => {
            return binding.destination === action.name;
          }
        );

        if (matchingBinding.length > 1) {
          console.warn("too many matching bindings. I don't handle this yet");
        }
        if (matchingBinding.length === 0) {
          console.warn("no matching binding for action:", action);
        }

        return { type: action.type, binding: matchingBinding[0] };
      });

      return _.object(simpleNames, types);
    })
  );
  return Input;
}
bind(actionDefinition, bindingDefinition);

let parity = 0;
let ActiveActionSet = "cursor_in_right_hand";
function poll_ActionSetFrame(actionFrame) {
  // Poll input device(s)
  parity = (parity + 1) % 2;
  const { curr, prev } = parity === 0 ? evenInputFrame : oddInputFrame;
  poll_RightOculusTouchInput(RightOculusTouchGamepad, curr);

  const actions = _.keys(Input[ActiveActionSet]);
  for (var i = 0; i < actions.length; i++) {
    const binding = Input[ActiveActionSet][actions[i]].binding;
    const sourceInfo = binding.source.split("/");
    if (!sourceInfo[1] === "devices") {
      // resolve filter
    } else {
      const deviceName = sourceInfo[2];
      const simpleSourceName = sourceInfo[3];
      actionFrame[actions[i]] = curr[simpleSourceName]; // TODO: support multiple devices
    }
  }
}

// Read from the action input frame using this ID
function idForPath(path) {
  // TODO: Pack input in efficient structures, then use this ID to fetch it out.
  const simpleName = path.substring(path.lastIndexOf("/") + 1);
  return simpleName;
}

const cursorOrientationId = idForPath(
  "/cursor_in_right_hand/in/cursor_orientation"
);
const cursorPositionId = idForPath("/cursor_in_right_hand/in/cursor_position");
const cursorInteractId = idForPath("/cursor_in_right_hand/in/interact");

function getBool(actionFrame, id) {
  return actionFrame[id];
}

function getQuaternion(actionFrame, id, quaternion) {
  return quaternion.fromArray(actionFrame[id]);
}

function getVector3(actionFrame, id, vector3) {
  return vector3.fromArray(actionFrame[id]);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AltArray is an object pool so that we can avoid reallocating memory when we want to add/remove items
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function AltArray(constructor, size) {
  this.firstUnused = 0;
  this.elements = [];
  for (let i = 0; i < size; i++) {
    this.elements.push(new constructor());
  }
  this.size = size;
}

Object.assign(AltArray.prototype, {
  constructor: AltArray,
  borrow: function() {
    const unused = this.elements[this.firstUnused];
    this.firstUnused = this.firstUnused + 1;
    return unused;
  },

  refund: function refund(index) {
    this.elements[index].copy(this.elements[this.firstUnused - 1]); // TODO: What if this.firstUnused === 0?
    this.firstUnused = this.firstUnused - 1;
  },

  get: function get(i) {
    return this.elements[i];
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Scene hierarchy stuff
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const TransformFlag_Dirty = 1 << 1;
function Transform() {
  return {
    flags: 0,
    entity: Math.random(), // hope for no collisions
    matrix: new THREE.Matrix4(),
    worldMatrix: new THREE.Matrix4()
  };
}
Transform.prototype.copy = function copy(other) {
  this.flags = other.flags;
  this.entity = other.entity;
  this.matrix.copy(other.matrix);
  this.worldMatrix.copy(other.worldMatrix);
};
function TransformAssociation() {
  return {
    flags: 0,
    parent: -1,
    child: -1
  };
}
TransformAssociation.prototype.copy = function copy(other) {
  this.flags = other.flags;
  this.parent = other.parent;
  this.child = other.child;
};
const PendingTransformationFlag_MatrixChanged = 1 << 1;
const PendingTransformationFlag_ParentMatrixWorldChanged = 1 << 2;
function PendingTransformation() {
  return {
    flags: 0,
    entity: -1,
    matrix: new THREE.Matrix4()
  };
}
PendingTransformation.prototype.copy = function copy(other) {
  this.flags = other.flags;
  this.entity = other.entity;
  this.matrix = other.matrix;
};
function Object3DInterrop() {
  return {
    flags: 0,
    entity: -1,
    object3D: null
  };
}
Object3DInterrop.prototype.copy = function copy(other) {
  this.flags = other.flags;
  this.entity = other.entity;
  this.object3D = other.object3D;
};
function Object3DInterropCopy() {
  return {
    matrixWorld: new THREE.Matrix4(),
    matrix: new THREE.Matrix4(),
    object3D: null
  };
}
Object3DInterropCopy.prototype.copy = function copy(other) {
  this.matrix.copy(other.matrix);
  this.object3D = other.object3D;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const bufferLength = 3000;
const transforms = new AltArray(Transform, bufferLength);
const transformAssociations = new AltArray(TransformAssociation, bufferLength);
const pendingTransformations = new AltArray(
  PendingTransformation,
  bufferLength
);
const object3DInterrops = new AltArray(Object3DInterrop, bufferLength);
const pendingObject3DInterropCopies = new AltArray(
  Object3DInterropCopy,
  bufferLength
);

const Vector3_Ones = new THREE.Vector3(1, 1, 1);
const Helper_Matrix4 = new THREE.Matrix4();
const Helper_Vector3 = new THREE.Vector3();
const Helper_Quaternion = new THREE.Quaternion();

let myCam = null;
let cursorTransform = transforms.borrow();
cursorTransform.flags = 0;
let cursorInterrop = object3DInterrops.borrow();
cursorInterrop.flags = 0;
cursorInterrop.entity = cursorTransform.entity;
cursorInterrop.object3D = new THREE.Mesh(
  new THREE.BoxBufferGeometry(0.15, 0.15, 0.15),
  new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })
);

let fooTransform = transforms.borrow();
fooTransform.flags = 0;
fooTransform.matrix.compose(
  new THREE.Vector3(0, 0, -1),
  new THREE.Quaternion(),
  Vector3_Ones
);

let fooInterrop = object3DInterrops.borrow();
fooInterrop.flags = 0;
fooInterrop.entity = fooTransform.entity;
fooInterrop.object3D = new THREE.Mesh(
  new THREE.BoxBufferGeometry(0.15, 0.15, 0.15),
  new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })
);
let fooAssociation = transformAssociations.borrow();
fooAssociation.flags = 0;
fooAssociation.parent = cursorTransform.entity;
fooAssociation.child = fooTransform.entity;

function myInit(scene, camera) {
  myCam = camera;
  scene.add(cursorInterrop.object3D);
  scene.add(fooInterrop.object3D); // Added to scene directly. NOT added to cursor
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Game Loop
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let actionFrame = {};
let loops = 0;
function myLoop() {
  loops = loops + 1;

  ////////////////////////////////////////////////////////////////////////////
  // Query for input device
  //
  // TODO: How do I react to device connection / disconnection?
  ////////////////////////////////////////////////////////////////////////////
  if (!RightOculusTouchGamepad) {
    RightOculusTouchGamepad = GetRightOculusTouchGamepad();
    return;
  }

  ////////////////////////////////////////////////////////////////////////////
  // Get actions for the active action set
  //
  // TODO: Is there a performance benefit to only reading parts of the device that I'm going to use?
  // TODO: What do I do about curr/prev when the action set changes?
  // TODO:
  ////////////////////////////////////////////////////////////////////////////
  poll_ActionSetFrame(actionFrame);

  let doPrint = false;
  if (ActiveActionSet === "cursor_in_right_hand") {
    if (getBool(actionFrame, cursorInteractId)) {
      // Get cursor position and orientation from actionFrame
      getVector3(actionFrame, cursorPositionId, Helper_Vector3);
      Helper_Vector3.add(myCam.position).add(new THREE.Vector3(-0.5, 0, 0.3));
      getQuaternion(actionFrame, cursorOrientationId, Helper_Quaternion);
      Helper_Matrix4.compose(Helper_Vector3, Helper_Quaternion, Vector3_Ones);

      // Add pending transformation to affect cursor
      const pendingTransformation = pendingTransformations.borrow();
      pendingTransformation.flags = 0;
      pendingTransformation.flags |= PendingTransformationFlag_MatrixChanged;
      pendingTransformation.entity = cursorTransform.entity;
      pendingTransformation.matrix.copy(Helper_Matrix4);

      doPrint = true;
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  // Process PendingTransformations
  //
  // TODO: Suppose I'm trying to minimize L2 cache misses. How can I do this?
  ////////////////////////////////////////////////////////////////////////////
  let i = 0;
  while (i < pendingTransformations.firstUnused) {
    const pendingTransformation = pendingTransformations.get(i);
    const entity = pendingTransformation.entity;
    let transform = null;
    for (let j = 0; j < transforms.firstUnused; j++) {
      transform = transforms.get(j);
      if (transform.entity === entity) {
        transform.flags |= TransformFlag_Dirty;

        if (
          (pendingTransformation.flags &
            PendingTransformationFlag_MatrixChanged) ===
          PendingTransformationFlag_MatrixChanged
        ) {
          const parentWorldMatrix = null;

          for (let k = 0; k < transformAssociations.firstUnused; k++) {
            const association = transformAssociations.get(k);
            if (association.child === entity) {
              const parent = association.parent;
              for (let q = 0; q < transforms.firstUnused; q++) {
                if (transforms.get(q).entity === parent) {
                  parentWorldMatrix = transforms.get(q).worldMatrix;
                }
                break;
              }
              break;
            }
          }

          if (parentWorldMatrix) {
            transform.matrix.copy(pendingTransformation.matrix);
            transform.worldMatrix.multiplyMatrices(
              parentWorldMatrix,
              transform.matrix
            );
          } else {
            transform.matrix.copy(pendingTransformation.matrix);
            transform.worldMatrix.copy(pendingTransformation.matrix);
          }
        } else if (
          (pendingTransformation.flags &
            PendingTransformationFlag_ParentMatrixWorldChanged) ===
          PendingTransformationFlag_ParentMatrixWorldChanged
        ) {
          transform.worldMatrix.multiplyMatrices(
            pendingTransformation.matrix,
            transform.matrix
          );
        }
        break;
      }
    }
    // Cascade changes through the children
    for (let j = 0; j < transformAssociations.firstUnused; j++) {
      const association = transformAssociations.get(j);
      if (association.parent === entity) {
        const childTransformation = pendingTransformations.borrow();
        childTransformation.entity = association.child;
        childTransformation.flags = 0;
        childTransformation.flags |= PendingTransformationFlag_ParentMatrixWorldChanged;
        childTransformation.matrix.copy(transform.worldMatrix);
      }
    }
    i = i + 1;
  }
  pendingTransformations.firstUnused = 0;

  ////////////////////////////////////////////////////////////////////////////
  // Write to Object3D's
  ////////////////////////////////////////////////////////////////////////////
  for (let j = 0; j < object3DInterrops.firstUnused; j++) {
    const object3DInterrop = object3DInterrops.get(j);
    for (let k = 0; k < transforms.firstUnused; k++) {
      const transform = transforms.get(k);
      if (
        object3DInterrop.entity === transform.entity &&
        (transform.flags & TransformFlag_Dirty) === TransformFlag_Dirty
      ) {
        const copy = pendingObject3DInterropCopies.borrow();
        copy.matrixWorld.copy(transform.worldMatrix);
        copy.matrix.copy(transform.worldMatrix);
        copy.object3D = object3DInterrop.object3D;
        transform.flags ^= TransformFlag_Dirty;
      }
    }
  }
  for (let j = 0; j < pendingObject3DInterropCopies.firstUnused; j++) {
    const pendingCopy = pendingObject3DInterropCopies.get(j);
    const matrixWorld = pendingCopy.matrixWorld;
    const matrix = pendingCopy.matrix;
    const object3D = pendingCopy.object3D;
    object3D.matrix.copy(matrix);
    object3D.matrixWorld.copy(matrixWorld);
    object3D.matrix.decompose(
      object3D.position,
      object3D.quaternion,
      object3D.scale
    );
    object3D.matrixAutoUpdate = false;
  }
  pendingObject3DInterropCopies.firstUnused = 0;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
