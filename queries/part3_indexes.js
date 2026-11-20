const {outlineConsole} = require("./outlineConsole.js");
db = db.getSiblingDB("spotify");

const task1 = () => {
    const getStat = () => db.tracks.find({
        track_genre: "pop",
        "audio_features.danceability": { $gte: 0.7 }
    }).sort({ popularity: -1 }).explain("executionStats");

    outlineConsole(`Запит без індекса
        ${JSON.stringify(getStat(), null, 2)}`);

    db.tracks.createIndex({
        track_genre: 1,
        popularity: -1,
        "audio_features.danceability": 1
    })

    outlineConsole(`Запит з індексом
        ${JSON.stringify(getStat(), null, 2)}`);
}

const task2 = () => {
    const getStat = () => db.tracks.find({
        explicit: true,
        "audio_features.instrumentalness": { $gte: 0.1 },
        "audio_features.instrumentalness": { $lte: 0.15 },
        "audio_features.speechiness": { $gte: 0.03 },
    }).explain("executionStats");

    outlineConsole(`Запит без індекса
        ${JSON.stringify(getStat(), null, 2)}`);

    db.tracks.createIndex({
        explicit: 1,
        "audio_features.instrumentalness": 1,
        "audio_features.speechiness": 1,
    })

    outlineConsole(`Запит з індексом
        ${JSON.stringify(getStat(), null, 2)}`);
}

const task3 = () => {
    const res = db.tracks.find(
        {
            track_genre: "pop",
            popularity: { $gte: 70 }
        },
    ).explain("executionStats")
    
    outlineConsole(`Покривний запит
        ${JSON.stringify(res, null, 2)}`);
}

task1();
task2();
task3();

    

