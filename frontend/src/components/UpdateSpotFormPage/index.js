import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux"
import { Redirect, useHistory, useParams } from "react-router-dom";
import { thunkGetSpotById, thunkEditSpot } from "../../store/spots";
import './UpdateSpotFormPage.css'
import GetSpotDetails from "../SpotDetails";

function UpdateSpotForm({ setShowUpdate }) {

  const user = useSelector(state => state.session.user)

  const { spotId } = useParams()

  const formInfo = useSelector(state => state.spots[spotId])
  console.log("data: ", formInfo)

  const [name, setName] = useState(formInfo.name)
  const [address, setAddress] = useState(formInfo.address)
  const [city, setCity] = useState(formInfo.city)
  const [state, setState] = useState(formInfo.state)
  const [country, setCountry] = useState(formInfo.country)
  const [lat, setLat] = useState(formInfo.lat)
  const [lng, setLng] = useState(formInfo.lng)
  const [price, setPrice] = useState(formInfo.price)
  const [description, setDescription] = useState(formInfo.description)
  // const [previewImage, setPreviewImage] = useState('')
  const [url, setUrl] = useState(formInfo.Images[0].url)
  const [errors, setErrors] = useState([])
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const history = useHistory()

  const dispatch = useDispatch()
  useEffect(() => {
    const errors = []
    if (name.length < 1 || name.length > 49) errors.push("Name length must be between 1 and 49 characters")
    if (!address.length) errors.push("Please provide an address");
    if (!city.length) errors.push("Please provide a city");
    if (!state.length) errors.push("Please provide a state")
    if (!country.length) errors.push("Please provide a country")
    if (!lat) errors.push("Please provide a lat")
    if (!lng) errors.push("Please provide a lng")
    if (price <= 0) errors.push("Please set a valid price");
    // if (!previewImage) errors.push("Please provide a image");
    if (!url) errors.push("Please provide a image");
    if (!description) errors.push("Please provide a description")

    return setErrors(errors)

  }, [name, address, city, state, country, lat, lng, price, url, description])


  async function onSubmit(e) {
    e.preventDefault()

    setHasSubmitted(true)
    if (errors.length > 0) return alert('invalid submission')

    const updatedSpot = {
      id: spotId, name, address, city, state, country, lat, lng, price, url, description
    }

    function isImg(url) {
      return url;
    }

    if (isImg(url)) {
      dispatch(thunkEditSpot(updatedSpot)).then(() => dispatch(thunkGetSpotById()))
      history.push(`/`)
    }

    dispatch(thunkEditSpot(updatedSpot))
    dispatch(thunkGetSpotById(spotId))
    setShowUpdate(false)
    history.push(`/spots/${spotId}`)
  }

  if (user === null) {
    alert("must be logged in to edit a spot")
    return <Redirect to="/" />
  }

  return (
    <form className="edit-form-container" onSubmit={onSubmit}>
      <div className="edit-form-wrapper">
        <div className="edit-title-container">
          <h3 id='edit-title'>Update My Spot</h3>
        </div>
        <div className="edit-form-input">
          <input
            className="form-input first update"
            type="text"
            placeholder='Name'
            minLength="1"
            maxLength="50"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="form-input middle update"
            type="text"
            placeholder="Address"
            minLength="1"
            maxLength="50"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            className="form-input middle update"
            type="text"
            placeholder="City"
            minLength="1"
            maxLength="30"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            className="form-input middle update"
            type="text"
            placeholder="State"
            minLength="1"
            maxLength="30"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
          <input
            className="form-input middle update"
            type="text"
            placeholder="Country"
            minLength="1"
            maxLength="30"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <input
            className="form-input middle update"
            type="number"
            placeholder="Latitude"
            min="-90"
            max="90"
            step="0.01"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
          <input
            className="form-input middle update"
            type="number"
            placeholder="Longitude"
            min="-180"
            max="180"
            step="0.01"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required
          />
          <input
            className="form-input middle update"
            type="number"
            placeholder="Price"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <input
            className="form-input middle update"
            type="url"
            name="preview-image"
            placeholder="Image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <input
            className="form-input last desc update"
            type="text"
            placeholder="Description"
            minLength="1"
            maxLength="50"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="edit-form-errors">
            {hasSubmitted && errors.length > 0 && (
              <ul>
                {errors.map(error => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <button className="submit-button" type="submit">Update Spot</button>
    </form>
  )
}

export default UpdateSpotForm
