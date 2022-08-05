const express = require('express')
const { Spot, User, Review, Image, Booking, sequelize } = require('../../db/models');
const { requireAuth, restoreUser } = require('../../utils/auth');
const router = express.Router();



// //GET ALL SPOTS
//Part 1
router.get('/', async (req, res) => {
    const allSpots = await Spot.findAll({
        attributes: {
            include: [
                [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgRating"]  //AvgRating Column Added using sequelize functions in the stars column
            ]
        },
        include: [     //Provide access to Review model from associations
            { model: Review, attributes: [] }
        ],
        group: ['Spot.id'],
        raw: true //method to convert out from findByPk && findOne into raw data aka JS object... otherise data will resemble console.log(req)
    })

    //Part 2 - Associate previewImage with Spots
    //Iterate through each spot in allSpots variable
    for (let spot of allSpots) {
        const image = await Image.findOne({
            attributes: ['url'],
            where: {
                previewImage: true,
                spotId: spot.id
            },
            raw: true
        })

        //Determine if image contains a url link
        if (image) { // if image exists, set the url of the image equal to the value of previewImage
            spot.previewImage = image.url
        } else {
            spot.previewImage = null
        }
    }

    res.status(200)
    res.json({ allSpots })
})



// Get all Spots owned by the Current User
router.get('/current', requireAuth, async (req, res) => {
    let userId = req.user.dataValues.id

    const allSpots = await Spot.findAll({
        attributes: {
            include: [
                [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgRating"],
            ]
        },
        include: [
            { model: User, where: { id: userId }, as: 'Owner', attributes: [] },
            { model: Review, attributes: [] }
        ],
        group: ['Spot.id'],
        raw: true
    })
    for (let spot of allSpots) {
        const image = await Image.findOne({
            attributes: ['url'],
            where: {
                previewImage: true,
                spotId: spot.id
            },
            raw: true
        })

        //Determine if image contains a url link
        if (image) { // if image exists, set the url of the image equal to the value of previewImage
            spot.previewImage = image.url
        } else {
            spot.previewImage = null
        }
    }
    res.status(200)
    res.json({ allSpots })
})



// Get details of a Spot from an id
router.get('/:spotId', async (req, res) => {
    const spotId = req.params.spotId
    const spot = await Spot.findByPk(spotId)

    if (!spot) {
        res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }

    const numReviews = await Review.count({
        where: { spotId: spotId }
    })

    const rating = await Review.findOne({
        attributes: [[sequelize.fn("avg", sequelize.col('stars')), "avgStarRating"]],
        where: { spotId: spotId },
        raw: true
    })

    const images = await Image.findAll({
        attributes: ['id', ['spotId', 'imageableId'], 'url'],
        where: { spotId: spotId }
    })

    const owner = await User.findByPk(spot.ownerId, {
        attributes: ['id', 'firstName', 'lastName']
    })

    const response = spot.toJSON()

    response.numReviews = numReviews
    response.avgStarRating = rating.avgStarRating
    response.Images = images
    response.Owner = owner

    res.json(response)
})



// Create a Spot
router.post('/', requireAuth, async (req, res) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body
    let userId = req.user.dataValues.id

    const newSpot = await Spot.create({
        ownerId: userId, address, city, state, country, lat, lng, name, description, price
    })
    if (newSpot) {
        res.json(newSpot)
    } else {
        res.status(400)
        res.json({
            message: 'Validation Error',
            statusCode: 400,
            errors: {
                address: "Street address is required",
                city: "City is required",
                state: "State is required",
                country: "Country is required",
                lat: "Latitude is not valid",
                lng: "Longitude is not valid",
                name: "Name must be less than 50 characters",
                description: "Description is required",
                price: "Price per day is required"
            }
        })
    }

})


// Add an Image to a Spot based on the Spot's id
router.post('/:spotId/images', requireAuth, async (req, res) => {

    // DECONSTRUCT SPOT ID
    const spotId = req.params = req.params.spotId;

    //DECONSTRUCT USER, URL & PREVIEW IMAGE
    const { user } = req
    const { url, previewImage } = req.body


    //IF USER DOESN'T EXIST - THROW ERROR
    if (!user) return res.status(401).json({ "message": "You need to be logged in to make any changes", "statusCode": 401 })


    //CONFIRM IF SPOT ID EXISTS
    const spot = await Spot.findByPk(spotId)


    //THROW ERROR IF SPOT COULD NOT BE FOUND
    if (!spot) {
        res.status(404)
        return res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }

    // CREATE
    const image = await Image.create({ url, previewImage, spotId, userId: user.id })

    //DEFINE AN OBJECT IN ORDER TO MAKE THE ASSOCIATION
    const object = {}
    object.id = image.id
    object.imageableId = parseInt(spotId)
    object.url = image.url

    res.status(200).json(object)

})



// Edit a Spot
router.put('/:spotId', requireAuth, async (req, res) => {
    const { spotId } = req.params
    const { address, city, state, country, lat, lng, name, description, price } = req.body

    const editSpot = await Spot.findByPk(spotId)

    if (editSpot) {
        editSpot.set({ address, city, state, country, lat, lng, name, description, price });
        await editSpot.save()
        res.json(editSpot)
    } else {
        res.status(404)
        res.json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }
})

// // Missing Error handler here: (But taken care of in with validators in model)
// res.status(400)
// res.json({
//     message: 'Validation Error',
//     statusCode: 400,
//     errors: {
//         address: "Street address is required",
//         city: "City is required",
//         state: "State is required",
//         country: "Country is required",
//         lat: "Latitude is not valid",
//         lng: "Longitude is not valid",
//         name: "Name must be less than 50 characters",
//         description: "Description is required",
//         price: "Price per day is required"
//     }
// })



//Delete a Spot
router.delete("/:spotId", async (req, res) => {
    const { spotId } = req.params;
    const findSpot = await Spot.findByPk(spotId);

    // console.log('current spot',findSpot)
    if (!findSpot) {
        res.status(404);
        res.json({
            message: "Spot couldn't be found",
            statusCode: 404,
        });
    }
    await findSpot.destroy();
    res.json({
        message: "Successfully deleted",
        statusCode: 200,
    });

});


// Get all Reviews by a Spot's id
router.get('/:spotId/reviews', async (req, res) => {
    let { spotId } = req.params
    const findSpot = await Spot.findByPk(spotId)

    const allReviews = await Review.findAll({
        where: { spotId },
        include: [
            { model: User, attributes: ['id', 'firstName', 'lastName'] },
            { model: Image }
        ]
    })

    if (findSpot) {
        res.status(200)
        res.json({ allReviews })
    } else {
        res.status(404)
        res.json({
            message: "Spot couldn't be found",
            statusCode: 404,
        })
    }
})



// Create a Review for a Spot based on the Spot's id
router.post('/:spotId/reviews', requireAuth, async (req, res) => {
    const { review, stars } = req.body;

    const { spotId } = req.params
    const findSpot = await Spot.findByPk(spotId)

    const { user } = req
    const userId = user.dataValues.id // id of current logged in user

    // find all reviews for a Spot
    const allReviews = await Review.findAll({
        include: [
            { model: Spot, where: { id: spotId } }
        ]
    })

    if (findSpot) {
        //* Error response: Review from the current user already exists for the Spot
        let reviewed;
        for (let reviews of allReviews) {
            if (reviews.userId === userId) {
                reviewed = true
            }
        }
        if (reviewed) {
            res.status(403)
            res.json({
                message: "User already has a review for this spot",
                statusCode: 403
            })
        } else if (stars < 1 || stars > 5) {  //* Error Response: Body validation errors
            res.status(400)
            res.json({
                message: "Validation error",
                statusCode: 400,
                errors: {
                    review: "Review text is required",
                    stars: "Stars must be an integer from 1 to 5",
                }
            })
        } else {
            // Create Review
            const spotReview = await Review.create({
                userId, spotId, review, stars
            })
            res.json(spotReview)
        }
    } else {
        //* Error response: Couldn't find a Spot with the specified id
        res.status(404)
        res.json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }
})



// Get all Bookings for a Spot based on the Spot's id
router.get('/:spotId/bookings', requireAuth, async (req, res) => {
    let { spotId } = req.params
    const findSpot = await Spot.findByPk(spotId)

    const owner = await Spot.findAll({
        include: [
            { model: User, where: { id: spotId }, as: 'Owner', attributes: [] }
        ]
    })

    const allBookings = await Booking.findAll({
        where: { spotId },
        include: [
            { model: User, attributes: ['id', 'firstName', 'lastName'] },
        ]
    })

    if (findSpot) {
        res.status(200)
        res.json({ allBookings })
    } else {
        res.status(404)
        res.json({
            message: "Spot couldn't be found",
            statusCode: 404,
        })
    }
})



// Create a Booking from a Spot based on the Spot's id
router.post('/:spotId/bookings', requireAuth, async (req, res) => {
    const { startDate, endDate } = req.body

    const { spotId } = req.params
    const findSpot = await Spot.findByPk(spotId)

    const { user } = req
    const userId = user.dataValues.id

    const allBoookings = await Booking.findAll({
        include: [
            { model: Spot, where: { id: spotId } }
        ]
    })

    if (findSpot) {
        //* Error response: Booking already exists for the Spot
        let booked;
        for (let booking of allBoookings) {
            if (booking.userId === userId) {
                booked = true
            }
        }
        if (booked) {
            res.status(403)
            res.json({
                message: "Sorry, this spot is already booked for the specified dates",
                statusCode: 403,
                errors: {
                    startDate: "Start date conflicts with an existing booking",
                    endDate: "End date conflicts with an existing booking"
                }
            })
        } else if (endDate < startDate) {  //* Error Booking: Body validation errors
            res.status(400)
            res.json({
                message: "Validation error",
                statusCode: 400,
                errors: {
                    "endDate": "endDate cannot be on or before startDate"
                }
            })
        } else {
            // Create Booking
            const spotBooking = await Booking.create({
                spotId, userId, startDate, endDate
            })
            res.json(spotBooking)
        }
    } else {
        //* Error response: Couldn't find a Spot with the specified id
        res.status(404)
        res.json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }
})


// NOT WORKING!!!
// // Return spots filtered by query parameters.
//  router.get('/', async (req, res) => {
//     let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;
//     let pagination = {filter: []}
//     page = parseInt(page);
//     size = parseInt(size);

//     if (Number.isNaN(page)) page = 1;
//     if (Number.isNaN(size)) size = 20;
//     pagination.limit = size
//     pagination.offset = size * (page - 1)


//     if (minLat) pagination.filter.push({lat: {[Op.gte]: Number(minLat)}})
//     if (maxLat) pagination.filter.push({lat: {[Op.lte]: Number(maxLat)}})
//     if (minLng) pagination.filter.push({lng: {[Op.gte]: Number(minLng)}})
//     if (maxLng) pagination.filter.push({lng: {[Op.lte]: Number(maxLng)}})
//     if (minPrice) pagination.filter.push({price: {[Op.gte]: Number(minPrice)}})
//     if (maxPrice) pagination.filter.push({price: {[Op.lte]: Number(maxPrice)}})

//     const allSpots = await Spot.findAll({
//         where: {
//             [Op.and]: pagination.filter
//         },
//         limit: pagination.limit,
//         offset: pagination.offset,
//     })
//     for (let spot of allSpots) {
//         const spotReviewData = await spot.getReviews({
//           attributes: [
//             [sequelize.fn("AVG", sequelize.col("stars")), "avgStarRating"],
//           ],
//         });

//         const avgRating = spotReviewData[0].dataValues.avgStarRating;
//         spot.dataValues.avgRating = Number(avgRating).toFixed(1);
//         const previewImage = await Image.findOne({
//           where: {
//             [Op.and]: {
//               spotId: spot.id,
//               previewImage: true,
//             },
//           },
//         });
//         if (previewImage) {
//           spot.dataValues.previewImage = previewImage.dataValues.url;
//         }
//       }
//     res.json({
//         page: page,
//         size: size,
//         allSpots,
//     })
//   })



module.exports = router
