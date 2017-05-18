import React, {Component} from 'react'

class Block extends Component {
  render () {
    const {
      color
    } = this.props
    return (
      <div className='block' style={{backgroundColor: color}} />
    )
  }
}
export default Block
