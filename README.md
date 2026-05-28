# Week 3 Example 1: Classes and Fighter Objects

## What This Example Demonstrates

> **Note for students:** This section is included in example files only to help you study. Do not include it in your Side Quest submissions.

This example introduces JavaScript classes by building two fighters from the same blueprint, each with their own position, colour, and control keys.

- **Class** — a blueprint that defines what an object has (properties) and what it can do (methods); defined once, used to create many instances
- **`constructor()`** — runs once when a new instance is created with `new Fighter(...)`; sets all the starting values for that instance
- **`this`** — refers to the specific instance calling the method; allows each fighter to have its own independent data
- **Methods** — functions defined inside a class (`update()`, `handleInput()`, `applyPhysics()`, `draw()`); called on each instance separately
- **Instances** — `fighter1` and `fighter2` are two separate objects created from the same Fighter class; changing one does not affect the other
- **`color()` object** — p5.js stores colour as an object using `color(r, g, b)`; passed into the constructor so each fighter can have a different colour
- **`random()`** — used to give each blob a different starting wobble offset so they animate independently
- **Blocking state** — `isBlocking` is updated every frame using `keyIsDown()`, toggling the shield ring on and off while the key is held

## Setup and Interaction Instructions

To run the sketch locally, open `index.html` in Google Chrome using Live Server.

**Player 1 Controls:**

- Move: A / D
- Block: G

**Player 2 Controls:**

- Move: Arrow Keys
- Block: L

**Opening the Chrome Console**

- **Windows:** Press `F12` or `Ctrl + Shift + J`, then click the **Console** tab
- **Mac:** Press `Cmd + Option + J`

The console will show any errors in your sketch.

## Assets

No external assets used. All visuals are generated with p5.js.

## References

N/A
