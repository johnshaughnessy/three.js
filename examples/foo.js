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

const rightHandCursor = {
  origin: [0, 0, 0],
  direction: [0, 0, 0]
};
const cursors = [rightHandCursor];

const quaternion = new THREE.Quaternion();

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

// Read from the action input frame using this ID
function idForPath(path) {}

function bind(actionDefinition, bindingDefinition) {
  const actionSetNames = _.uniq(
    _.map(actionDefinition.actions, action =>
      action.name.slice(1, 1 + _.indexOf(action.name.substring(1), "/"))
    )
  );

  let ret = _.object(
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

  console.log("actionSetNames:", actionSetNames);
  console.log("ret", ret);

  Input = ret;
  return Input;
}

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
      if (simpleSourceName === "a") {
      }
      actionFrame[actions[i]] = curr[simpleSourceName]; // TODO: support multiple devices
    }
  }
}

bind(actionDefinition, bindingDefinition);

const InputMap_CursorInRightHand = {};

let actionFrame = {};

let loops = 0;
function myLoop() {
  loops = loops + 1;
  // Query for input device
  if (!RightOculusTouchGamepad) {
    RightOculusTouchGamepad = GetRightOculusTouchGamepad();
    return;
  }

  // Query bound input
  poll_ActionSetFrame(actionFrame);

  // Move cursors
  for (var i = 0; i < cursors.length; i++) {}
}
