
function getSpotifyPlayer() {
    var curSongIndex = 0;
    var curSongs = [];
    var callback = null;
    var audio = null;
    var cache = {};

    function getSpotifyID(song) {
        console.log(song);
        var id = song.tracks[0].foreign_id;
        var rawID = id.split(':')[2];
        return rawID;
    }

    function hasTrack(song) {
        return song.tracks.length > 0;
    }

    function fetchSpotifyTrack(sid) {
        var url = 'https://api.spotify.com/v1/tracks/' + sid;
        $.getJSON(url, function(track) {
            console.log(track);
            playSpotifyTrack(track);
            fetchSpotifyAlbum(track.album.id);
        });
    }

    function fetchSpotifyAlbum(sid) {
        var url = 'https://api.spotify.com/v1/albums/' + sid;
        $.getJSON(url, function(album) {
            showSpotifyAlbum(album);
        });
    }

    function showSpotifyAlbum(album) {
        console.log('album', album);
        var image = getBestImage(album.images, 85);
        if (image) {
            $("#rp-album-art").attr('src', image.url);
        }
    }

    function getBestImage(images, minWidth) {
        var best = images[0];

        images.forEach(
            function(image) {
                if (image.width >= minWidth) {
                    best = image;
                }
            }
        );
        return best;
    }

    function playSpotifyTrack(track) {
        audio.setAttribute('src', track.preview_url);
        audio.play();
    }

    function playTrack(sid) {
        console.log('playing '  + sid);
        console.log(audio);
        fetchSpotifyTrack(sid);
    }

    function playSong(song) {
        if (hasTrack(song)) {
            var sid = getSpotifyID(song);
            playTrack(sid);
            if (callback) {
                callback(song);
            }
            $("#rp-song-title").text(song.title + " by " + song.artist_name);
            $("#rp-artist-name").text(" by " + song.artist_name);
        }
    }


    function playSongAndAdjustIndex(song) {
        playSong(song);

        for (var i = 0; i < curSongs.length; i++) {
            var csong = curSongs[i];
            if (csong.id == song.id) {
                curSongIndex = i + 1;
                break;
            }
        }
    }

    function playNextSong() {
        while (curSongIndex < curSongs.length) {
            var song = curSongs[curSongIndex++];
            if (hasTrack(song)) {
                playSong(song);
                break;
            }
        }
    }

    function playPreviousSong() {
        while (curSongIndex > 0) {
            var song = curSongs[--curSongIndex];
            if (hasTrack(song)) {
                playSong(song);
                break;
            }
        }
    }

    function startPlayingSongs(songs) {
        if (curSongs != songs) {
            curSongIndex = 0;
            curSongs = songs;
        }
        playNextSong();
    }

    function setCallback(cb) {
        callback = cb;
    }

    function addSongs(songs) {
        curSongIndex = 0;
        curSongs = songs;
        playNextSong();
    }

    function togglePause() {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    }

    function init() {
        audio = new Audio();

        audio.addEventListener('ended', function() {
            console.log('audio ended');
            playNextSong();
        });

        audio.addEventListener('pause', function() {
            console.log('audio paused');
        });

        audio.addEventListener('play', function() {
            console.log('audio played');
        });

        $("#rp-pause-play").click(function() {
            togglePause();
        });

        $("#rp-album-art").click(function() {
            togglePause();
        });

        $("#rp-play-next").click(function() {
            playNextSong();
        });

        $("#rp-play-prev").click(function() {
            playPreviousSong();
        });
    }

    var methods = {   
        addSongs : addSongs,
        playSong: playSongAndAdjustIndex,
        next:playNextSong,
        setCallback:setCallback
    }
    init();
    return methods;
}


