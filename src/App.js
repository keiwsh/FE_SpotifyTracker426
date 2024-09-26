import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./App.css"; // For styling

function App() {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use your Heroku backend URL
  const backendUrl = "https://spotifytracker-938d28f9ab12.herokuapp.com/";
  const accessToken = new URLSearchParams(window.location.search).get(
    "access_token"
  );

  const fetchCurrentlyPlaying = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true); // Start loading
      const response = await axios.get(
        `${backendUrl}currently-playing?access_token=${accessToken}`
      );

      if (response.data) {
        setTrack(response.data);
      } else {
        setError("No track is currently playing.");
      }
    } catch (error) {
      console.error("Error fetching currently playing track:", error);
      setError("Error fetching currently playing track.");
    } finally {
      setLoading(false); // Stop loading
    }
  }, [accessToken, backendUrl]);

  useEffect(() => {
    fetchCurrentlyPlaying();
  }, [fetchCurrentlyPlaying]);

  const handlePlayPause = () => {
    if (track) {
      const player = window.spotifyPlayer;
      if (player) {
        player.togglePlay();
      }
    }
  };

  useEffect(() => {
    if (window.Spotify && accessToken) {
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "Music Player",
          getOAuthToken: (cb) => {
            cb(accessToken);
          },
        });

        player.addListener("ready", ({ device_id }) => {
          console.log("Spotify Player is ready");
          window.spotifyPlayer = player;
        });

        player.addListener("not_ready", ({ device_id }) => {
          console.log("Spotify Player is not ready");
        });

        player.connect();
      };

      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [accessToken]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Music Player</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {track ? (
          <div className="track-info">
            <img
              src={track.item.album.images[0].url}
              alt={track.item.name}
              className="track-artwork"
            />
            <div className="track-details">
              <h2>{track.item.name}</h2>
              <p>
                {track.item.artists.map((artist) => artist.name).join(", ")}
              </p>
              <p>{track.item.album.name}</p>
              <button onClick={handlePlayPause}>
                {track.is_playing ? "Pause" : "Play"}
              </button>
            </div>
          </div>
        ) : (
          <p>No track is currently playing.</p>
        )}
      </header>
    </div>
  );
}

export default App;
