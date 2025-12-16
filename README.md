
# AICINEMASUITE.com - Build Instructions

The `dist` folder is **automatically generated** by the build process.

To create the `dist` folder, follow these steps exactly:

### 1. Open Project in Terminal
1. Open the **Terminal** app.
2. Type `cd ` (don't forget the space at the end!).
3. Drag your `aicinemasuite` folder from Finder into the Terminal window.
4. Press **Enter**.

*If done correctly, the terminal should show your folder path.*

### 2. Install Tools
Run this command:
```bash
npm install
```
*If it says "Permission denied" or fails, try: `sudo npm install` and type your Mac password.*

### 3. Create the Build
Run this command:
```bash
npm run build
```

### 4. Deploy
1. Open your project folder in Finder.
2. You will see a new folder named **`dist`**.
3. This `dist` folder is your final website. Upload ONLY this folder to Netlify.
