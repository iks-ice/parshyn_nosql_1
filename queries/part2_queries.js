db = db.getSiblingDB("spotify");
const danceTracks = db["tracks"].find({
    "audio_features.danceability": {
        "$gt": 0.7,
    },
    "audio_features.energy": {
        "$gt": 0.7,
    },
    "duration_ms": {
        "$gte": 3 * 60 * 1000,
        "$lte": 5 * 60 * 1000
    }
}).toArray()


const popularArtists = db["tracks"].aggregate([
    {
        $match: {
            popularity: {
                $gte: 60
            }
        }
    },
    {
        $unwind: "$artists",
    },
    {
        $group: {
            "_id": "$artists",
            tracks: {
                $sum: 1
            },
            minPopularity: {
                $min: "$popularity"
            },
            avgPopularity: {
                $avg: "$popularity"
            }
        }
    },
    {
        $match: {
            "tracks": { $gte: 3}
        }
    },
    {
        $sort: {
            avgPopularity: -1,
        }
    },
    {
        $limit: 20
    },
    {
        $project: {
            _id: 0,
            artist: "$_id",
            avgPopularity: {
                $round: ["$avgPopularity", 1]
            },
            tracks: 1,
            minPopularity: 1
        }
    }
]).toArray()

const {outlineConsole} = require("./outlineConsole.js");

outlineConsole(`Виконавці, у яких усі треки популярні 
    ${JSON.stringify(popularArtists, null, 2)}`)

const abnormalTracks = db["tracks"].aggregate([
    {
        $group: {
            _id: "$track_genre",
            tracks: {
                $push: {
                    _id: "$_id",
                    artists: "$artists",
                    track_name: "$track_name",
                    popularity: "$popularity",
                    audio_features: {
                        tempo: "$audio_features.tempo",
                    }
                }
            },
            avg_tempo: {
                $avg: "$audio_features.tempo"
            },
            std: {
                $stdDevPop: "$audio_features.tempo"
            }
        }
    },
    {
        $addFields: {
            outlier_threshold: {
                $add: [
                    "$avg_tempo",
                    {
                        $multiply: ["$std", 2]
                    }
                ]
            }
        }
    },
    {
        $project: {
            _id: 0,
            genre: "$_id",
            avg_tempo: 1,
            outlier_threshold: 1,
            outlier_tracks: {
                $filter: {
                input: "$tracks", 
                as: "track",         
                cond: {
                    $gt: [ "$$track.audio_features.tempo", "$outlier_threshold" ]
                    }
                }
            }
        }
    },

]).toArray();

outlineConsole(`Нетипові треки 
    ${JSON.stringify(abnormalTracks, null, 2)}`)

const backgroundTracks = db["tracks"].aggregate([
    {
        $match: {
            explicit: true,
            "audio_features.loudness": {
                $lt: -10,
            },
            "audio_features.speechiness": {
                $lt: 0.1,
            },
            "audio_features.instrumentalness": {
                $gt: 0.5,
            },
        }
    }
]).toArray()

outlineConsole(`Треки для фонової роботи
    кількість треків ${backgroundTracks.length}
    приклад треку${JSON.stringify(backgroundTracks[0], null, 2)}`)

    

