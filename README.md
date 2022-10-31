# Govee Node Server
A React+Node app originally to let my partner control my wifi LED lights from across the globe. Now I also like to use it for interviews :P  
  
On the client side, adjust the sliders and color pickers to change the brightness and color of the lightbulbs via REST API.  
You can save currently selected favorite colors as preset color swatches in the "Presets" accordion menu for each connected light. These presets are saved in localStorage.  
![image](https://user-images.githubusercontent.com/50963144/199040799-d7a1cc2d-090a-4e19-b40c-12a00b6c9f29.png)
  
Requests from the frontend React app are sent to this Node server, before being forwarded onto [Govee's external API](https://govee-public.s3.amazonaws.com/developer-docs/GoveeDeveloperAPIReference.pdf) (since these particular light bulbs do not have local API support).  
  
React-query is used to manage cache and refetch stale data automatically. However, Govee's official external API is aggressively rate-limited which severely limits how often we can automatically refetch data to keep the UI in sync (say, if we make changes via Govee's official app rather than this one).  
  
But wouldn't it be cool if not only we could get the current state more often, but even see external changes live? Of course it would! So, this app also makes use of websockets.  
Any interaction with the UI by you or others will update live for all clients. The server simply broadcasts all changes received to all clients. This is a separate route from the commands send to the external Govee API for actually changing the lights.
  
The client also [interpolates](https://en.wikipedia.org/wiki/Linear_interpolation) between websocket messages received from the server, so things look smoother. Meaning, if your client receives color updates (someone else is moving the color picker around) every 100ms, the UI will still update every say 16.7ms (60 FPS) and choose a value at a point between the received update and the currently *lerped* (linearly interpolated) value, thus inching closer each render in a smooth fashion. This allows us to reasonably cutdown on the amount of network activity and server load while keeping the live aspect of the UI responsive and smooth.  
  
This is like how video games smooth out player movement with network or server latency. If you're into game development, you've likely seen `lerp` a lot, haha.
  
## SETUP
1) Once you have cloned down or forked this repo, be sure to run `npm install` in the root directory to install the required dependencies.  
2) On your local dev build, you'll need to place a `.env` file in the root directory, configured as such:  
  ```
  GOVEE_KEY='replace this string with a string representing your external Govee api key'
  GOVEE_PORT="8080"
  ```  
3) If you don't have a Govee API key, you can request one by:  
    - Downloading and launching the Govee Home App on Android or Apple stores (you likely already have this, otherwise how did you find this repo lol).  
    - Head to your profile and click the cogwheel for `settings`.  
    - Click "Apply for API Key" and fill out the form.
    - Grab your API key from the email Govee sends you.  
    - Refer to the [API documentation here](https://govee-public.s3.amazonaws.com/developer-docs/GoveeDeveloperAPIReference.pdf) for future reference.
    
4) For your local development build, you'll need to fill in the `GOVEE_KEY` environment variable in the `.env` file you created, with the developer API key associated with your Govee account you received (the API key you request from Govee).  
  
5) Most hosting solutions have their own ways of setting environment variables, so wherever you decide to host this server, check with their documentation (netlify for example has an "Environment" setting under "Build and Deploy" where you can declare these for production).  
  
6) Deploy and enjoy! For now, the CORS policy is wide open. In a future version, you will also set your front-end address within your environment variables as well.

## Scripts

### npm start
Starts the node server! Easy enough.  
  
### npm run dev
Probably what you're looking for. Runs the server with nodemon so that any changes you make to the code will automatically restart/refresh the server.
