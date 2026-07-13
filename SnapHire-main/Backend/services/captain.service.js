const captainModel = require('../models/captain.model');    










module.exports.createCaptain = async({firstname,lastname,email,password,cameraType,skills,instagram,city,state,country}) =>{


    if(!firstname || !lastname || !email || !password || !cameraType || !skills || !instagram || !city || !state || !country){
        throw new Error('All fields are required');
    }


    const captain = await captainModel.create({
        fullname:{
            firstname,
            lastname
        },
        email,
        password,
        camera:{
            cameraType
        },
        location:{
            city,
            state,
            country
        },
        socialLinks:{
            instagram
        },
        skills
    })

    return captain;
}