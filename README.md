# Ryan Pattison Portfolio

Static portfolio site for Ryan Pattison, built with HTML, CSS, JavaScript, local media assets, Lottie icons, and a Three.js soda can playground.

## Local Preview

The site can be opened through the included `Open Portfolio.command`, or served from the project folder with any simple static server.

```sh
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/index.html
```

## Key Pages

- `index.html` - homepage
- `project.html?project=skimmu-money` - project detail template
- `wireframe-cylinder.html` - interactive soda can playground
- `shape-drawer.html` - shape drawer playground

## Deployment Notes

This is a static site with no build step required.

Recommended Vercel settings:

- Framework preset: Other
- Build command: leave blank
- Output directory: leave blank / project root
- Install command: leave blank

The repo includes large local video files. No individual file is currently over GitHub's 100 MiB hard limit, but video bandwidth should be watched after launch.

## Pre-Launch Checks

- Confirm all project pages load from the deployed URL.
- Test the homepage pucks and line smudge interaction.
- Test the soda can playground in a browser with WebGL enabled.
- Test desktop and mobile viewport widths.
- Check Vercel usage after launch, especially bandwidth from video assets.
