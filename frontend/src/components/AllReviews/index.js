import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from "react-router-dom"
import { thunkDeleteReview, thunkGetAllReviews } from "../../store/reviews";
import icon from './icons/icon.svg'
import './AllReview.css'

// const GetSpotReviews = () => {

//     const [isLoaded, setIsLoaded] = useState(false)

//     const { spotId } = useParams();
//     // const spotIdParsed = parseInt(spotId)
//     // const spot = useSelector(state => (state.spots[spotIdParsed]))

//     const sessionUser = useSelector(state => state.session.user)

//     const allReviews = useSelector(state => state.reviews)

//     const getAllReviewArr = Object.values(allReviews).map((review) => {
//         return (
//             <div className='review-container' key={review.id}>
//                 <div className='user-container' style={{ fontSize: '16px', fontWeight: 'bold' }}>
//                     <div className='box'>
//                         <img className='profile-img' src={icon} />
//                         <div className='user-name'>
//                             {review.User.firstName} {review.User.lastName}:
//                             {!sessionUser ? null : sessionUser.id === review.userId &&
//                             <button className='delete-review-button' onClick={(e) => deleteReview(e, review.id)}>
//                                 Delete Review
//                             </button>}
//                         </div>
//                     </div>
//                 </div>
//                 <div className='review'>
//                     {review.review}
//                 </div>

//             </div>
//         )
//     })

//     const dispatch = useDispatch();

//     const deleteReview = (e, id) => {
//         e.preventDefault()
//         dispatch(thunkDeleteReview(id))
//     }

//     useEffect(() => {
//         dispatch(thunkGetAllReviews(spotId)).then(() => setIsLoaded(true))
//     }, [dispatch, spotId])

//     if (!getAllReviewArr.length) {
//         return null
//     }

//     return (
//         isLoaded && (
//             <div>
//                 {getAllReviewArr}
//             </div>
//         )

//     )
// }

// export default GetSpotReviews



const GetSpotReviews = () => {
    const { spotId } = useParams();
    // const spotIdParsed = parseInt(spotId)
    // const spot = useSelector(state => (state.spots[spotIdParsed]))


    const allReviews = useSelector(state => state.reviews)
    const getAllReviewArr = Object.values(allReviews)


    const [isLoaded, setIsLoaded] = useState(false)


    const sessionUser = useSelector(state => state.session.user)


    const deleteReview = (e, id) => {
        e.preventDefault()
        dispatch(thunkDeleteReview(id))
    }

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(thunkGetAllReviews(spotId)).then(() => setIsLoaded(true))
    }, [dispatch, spotId])


    if (!getAllReviewArr.length) {
        return null
    }

    return (
        isLoaded && (
            <div>
                <ul>
                    {getAllReviewArr.map(review => {
                        return (
                            <div className='review-container' key={review.id}>
                                <div className='user-container' style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                    <div className='box'>
                                        <img className='profile-img' src={icon} />
                                        <div className='user-name'>
                                            {review.User.firstName} &nbsp;
                                            {review.User.lastName}
                                            {!sessionUser ? null : sessionUser.id === review.userId &&
                                                <button className='delete-review-button' onClick={(e) => deleteReview(e, review.id)}>
                                                    Delete Review
                                                </button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className='review'>
                                    {review.review}
                                </div>
                            </div>
                        )
                    })}
                </ul>
            </div>
        )
    )
}

export default GetSpotReviews
