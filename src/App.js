import React, { Component } from 'react'
import {deepFreeze as f} from 'freezr'
import HTML5Backend from 'react-dnd-html5-backend'
import {
  DragDropContext,
  DragSource,
  DropTarget
} from 'react-dnd'

let ids = 1
const COLORS = [
  'red', 'green', 'blue', 'navy', 'orange', 'pink'
]
const SIZES = [
  100, 50, 75
]
const newRef = () => ids++
const getColor = (ref) => COLORS[ref % COLORS.length]
const getSize = (ref) => SIZES[ref % SIZES.length]
const createBlock = () => {
  const ref = newRef()
  const color = getColor(ref)
  const height = getSize(ref)
  return f({ ref, color, height })
}

/**
 * 
 */
class Block extends Component {
  foo () {
    console.log('foo')
  }
  render () {
    const {connectDP, connectDS, connectDT, isOver, ...rest} = this.props
    // console.log('isover', isOver)
    return connectDP(connectDS(connectDT(
        <div {...rest} />
      )))
  }
}

const DraggableBlock = DragSource(
  'block', 
  {
    beginDrag (props) {
      return {}
    }
  },
  (connect, monitor) => {
    return {
      connectDS: connect.dragSource(),
      connectDP: connect.dragPreview()
    }
  }
)(Block)
const DroppableBlock = DropTarget(
  'block',
  {
    hover (props, monitor, component) {
      console.log('hover')
    },
    drop (props) {
      console.log('drop')
      props.onDrop()
    }
  },
  (connect, monitor) => {
    return {
      connectDT: connect.dropTarget(),
      isOver: monitor.isOver()
    }
  }
)(DraggableBlock)

class App extends Component {
  state = {
    list: f([]),
    dragging: null
  }
  addBlock = () => this.setState(({list}) => ({
    list: list.push(createBlock())
  }))
  move = (target) => {
    const {list, dragging} = this.state
    const originIndex = list.findIndex(({ref}) => ref === dragging)
    const targetIndex = list.findIndex(({ref}) => ref === target)
    console.log('move', originIndex, targetIndex, )
    this.setState(() => {
      return {
        list: list
          .deleteAt(originIndex)
          .insertAt(targetIndex, list[originIndex]),
        dragging: null
      }
    })
  }
  render() {
    console.log(this.state.list, this.state.dragging)
    return (
      <div>
        <button onClick={this.addBlock}>add</button>
        {this.state.list.map(({color, height, ref}) =>
            <DroppableBlock
              key={ref}
              style={{
                backgroundColor: color,
                height: `${height}px`
              }}
              onDrag={() => this.setState({dragging: ref})}
              onDrop={() => this.move(ref)}
            />
           )
        }
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(App)
