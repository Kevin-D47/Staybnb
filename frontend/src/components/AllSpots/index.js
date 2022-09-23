import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { thunkGetAllSpots } from '../../store/spots'
import { NavLink } from 'react-router-dom'
import starIcon from './icons/starIcon.png'
import './AllSpots.css'


const GetAllSpots = () => {

    const allSpots = useSelector(state => state.spots)
    const allSpotsArr = Object.values(allSpots)

    const [isLoaded, setIsLoaded] = useState(false)

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(thunkGetAllSpots()).then(setIsLoaded(true));
    }, [dispatch])

    if (!allSpotsArr.length) {
        return null
    }

    return (
        isLoaded && (
            <div className='spots-container'>
                <div className='spots-cards-container'>
                    {allSpotsArr.map((spot) => (
                        <div key={spot.id}>
                            <NavLink to={`/spots/${spot.id}`}>
                                <img className='spot-img' src={spot.previewImage} alt=''></img>
                            </NavLink>
                            <div className='spot-info-container'>
                                <div className='spot-info-left'>
                                    <div style={{ fontSize: '16px', fontWeight: '600' }}>
                                        {spot.name}
                                    </div>
                                    <div style={{ fontSize: '14px', color: 'grey'}}>
                                        {spot.city}, {spot.state}
                                    </div>
                                    <div className='price-container'>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                            ${spot.price}
                                        </div>
                                        &nbsp; <div style={{ fontSize: '14px'}}>
                                            night
                                        </div>
                                    </div>
                                </div>
                                <div className='spot-info-right'>
                                    <div style={{ fontSize: '14px' }}>
                                        <img className='star-icon' src={starIcon} alt='' />
                                        {Number(spot.avgRating).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    )
}

export default GetAllSpots
