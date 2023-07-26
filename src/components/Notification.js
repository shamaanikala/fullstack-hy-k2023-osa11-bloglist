import PropTypes from 'prop-types'

// tyyppi joko annetaan literaalina tai
// käytin osa2 puhelinluetteloon omaa useState tyypille
const Notification = ({ message, type }) => {
  //console.log(type)
  if (message === null) {
    return null
  }

  return (
    <div className={type}>
      {message}
    </div>
  )
}

Notification.propTypes = {
  //message: PropTypes.string.isRequired, // ei voi ossa isRequired, jos null
  type: PropTypes.string.isRequired
}

export default Notification