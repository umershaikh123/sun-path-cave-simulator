# 🌞 Sun-Path + Cave Geometry Simulator

## 📖 Quranic Context

This project is inspired by **Surah Al-Kahf (18:17-18)**, which describes a remarkable phenomenon regarding the **People of the Cave**:

> “And you would have seen the sun, when it rose, inclining away from their cave to the right, and when it set, declining away from them to the left, while they lay in its open space… That is one of the signs of Allah.”  
> _(Qur’an 18:17)_

The verses imply a **specific cave orientation and solar path** that preserved the sleepers over centuries. By simulating sun trajectories at chosen latitudes and cave orientations, we aim to **explore the geometry** hinted at in the Qur’anic narrative and analyze the physical plausibility of the described sunlight behavior.

---

## 🎯 Objectives

- **Simulate** the daily solar azimuth and elevation for any latitude, longitude, and date.
- **Visualize** how the sun’s path would interact with a cave mouth of given orientation and tilt.
- **Identify configurations** where the sunlight “inclines away” during sunrise and sunset, consistent with 18:17.
- Provide a **tool for students, researchers, and enthusiasts** to explore potential historical or geographical scenarios matching the Qur’anic description.
- **Encourage deeper reflection** on the precision and meaning of the verses while respecting religious significance.

---

## 🧭 Outcomes

- A **Next.js web application** with interactive controls:
  - Adjustable latitude, longitude, date, and cave geometry.
  - Dynamic 2D/3D plots of the sun’s path.
  - Highlighted time intervals where sunlight avoids direct penetration.
- Data tables of solar positions for further analysis.
- Potential for **new insights** into cave orientations or locations that fit the Qur’anic description.

---

## 🛠 Tech Stack & Libraries

| Category        | Library/Tool                                    | Purpose                                          |
| --------------- | ----------------------------------------------- | ------------------------------------------------ |
| Framework       | [Next.js 14](https://nextjs.org/)               | React-based fullstack framework with App Router. |
| Language        | TypeScript                                      | Type safety and modern JavaScript development.   |
| Styling         | Tailwind CSS                                    | Utility-first responsive styling.                |
| UI Components   | [shadcn/ui](https://ui.shadcn.com/)             | Beautiful, accessible UI elements.               |
| Animation       | [Framer Motion](https://www.framer.com/motion/) | Smooth transitions for plots and markers.        |
| Solar Math      | [suncalc](https://github.com/mourner/suncalc)   | Calculate sun azimuth/elevation for given times. |
| Visualization   | [Three.js](https://threejs.org/)                | 3D rendering of cave geometry and sunbeams.      |
| Charts/2D Plots | D3.js or simple SVG rendering                   | Plot solar paths in 2D.                          |

---
