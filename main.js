//------------------------------------------------------------------------------
import {
  publicToken,
  mainSceneUUID,
  characterControllerSceneUUID,
} from "./config.js";

//------------------------------------------------------------------------------
window.addEventListener("load", InitApp);

//------------------------------------------------------------------------------
async function InitApp() {
  await SDK3DVerse.joinOrStartSession({
    userToken: publicToken,
    sceneUUID: mainSceneUUID,
    canvas: document.getElementById("display-canvas"),
    createDefaultCamera: false,
    startSimulation: "on-assets-loaded",
  });

  await InitFirstPersonController(characterControllerSceneUUID);

  // Saw
  SDK3DVerse.engineAPI.playAnimationSequence(
    "c3baeed0-fb83-4499-ad50-a0bc438e34df",
    { playbackSpeed: 0.5 }
  );

  // Orb
  SDK3DVerse.engineAPI.playAnimationSequence(
    "5e406c5f-f90d-4221-9763-abb039cb1a7f",
    { playbackSpeed: 0.2 }
  );

  // Orb
  SDK3DVerse.engineAPI.playAnimationSequence(
    "532f25d1-58c4-45bd-ae9d-07188e54171b",
    { playbackSpeed: 0.2 }
  );

  // Dragon
  SDK3DVerse.engineAPI.playAnimationSequence(
    "d975452f-b799-47c3-b9db-207f16900bc9",
    { playbackSpeed: 0.05 }
  );

  // Water
  SDK3DVerse.engineAPI.playAnimationSequence(
    "cbe41b27-2baf-4eff-98ff-60e3d0f02627",
    { playbackSpeed: 0.1 }
  );

  let b = 0;
  SDK3DVerse.engineAPI.onEnterTrigger((emitterEntity, triggerEntity) => {
    b = 100;
    document.getElementById("display-canvas").style.filter = "blur(100px)";
    const blurFunc = () => {
      b -= 10;
      b = b < 0 ? 0 : b;

      document.getElementById("display-canvas").style.filter = `blur(${b}px)`;
      if (b > 0) {
        setTimeout(blurFunc, 30);
      }
    };
    setTimeout(blurFunc, 30);
  });
}

//------------------------------------------------------------------------------
async function InitFirstPersonController(charCtlSceneUUID) {
  // To spawn an entity we need to create an EntityTempllate and specify the
  // components we want to attach to it. In this case we only want a scene_ref
  // that points to the character controller scene.
  const playerTemplate = new SDK3DVerse.EntityTemplate();
  playerTemplate.attachComponent("scene_ref", { value: charCtlSceneUUID });

  // Passing null as parent entity will instantiate our new entity at the root
  // of the main scene.
  const parentEntity = null;
  // Setting this option to true will ensure that our entity will be destroyed
  // when the client is disconnected from the session, making sure we don't
  // leave our 'dead' player body behind.
  const deleteOnClientDisconnection = true;
  // We don't want the player to be saved forever in the scene, so we
  // instantiate a transient entity.
  // Note that an entity template can be instantiated multiple times.
  // Each instantiation results in a new entity.
  const playerSceneEntity = await playerTemplate.instantiateTransientEntity(
    "Player",
    parentEntity,
    deleteOnClientDisconnection
  );

  // The character controller scene is setup as having a single entity at its
  // root which is the first person controller itself.
  const firstPersonController = (await playerSceneEntity.getChildren())[0];
  // Look for the first person camera in the children of the controller.
  const children = await firstPersonController.getChildren();
  const firstPersonCamera = children.find((child) =>
    child.isAttached("camera")
  );

  // We need to assign the current client to the first person controller
  // script which is attached to the firstPersonController entity.
  // This allows the script to know which client inputs it should read.
  SDK3DVerse.engineAPI.assignClientToScripts(firstPersonController);

  // Finally set the first person camera as the main camera.
  SDK3DVerse.setMainCamera(firstPersonCamera);
}
