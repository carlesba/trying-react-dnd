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
  render () {
    const {connectDP, connectDS, connectDT, isOver, blockRef, onMove, ...rest} = this.props
    return connectDP(connectDS(connectDT(
        <div {...rest} />
      )))
  }
}

const DraggableBlock = DragSource(
  'block', 
  {
    beginDrag (props) {
      console.log('beginDrag', props.blockRef)
      return {
        blockRef: props.blockRef
      }
    },
    endDrag (props, monitor) {
      if (monitor.didDrop()) {
        const {blockRef: dropRef} = monitor.getDropResult()
        props.onMove(props.blockRef, dropRef)
      }
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
    drop (props, monitor) {
      console.log('drop', props.blockRef)
      return {
        blockRef: props.blockRef
      }
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
    list: f([])
  }
  addBlock = () => this.setState(({list}) => ({
    list: list.push(createBlock())
  }))
  move = (dragRef, dropRef) => {
    console.log('move', dragRef, dropRef)
    const {list} = this.state
    const dragIndex = list.findIndex(({ref}) => ref === dragRef)
    const dropIndex = list.findIndex(({ref}) => ref === dropRef)
    console.log('move found:', dragIndex, dropIndex)
    this.setState(() => {
      const newList = list
          .deleteAt(dragIndex)
          .insertAt(dropIndex, list[dragIndex])
      return {
        list: newList,
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
              blockRef={ref}
              style={{
                backgroundColor: color,
                height: `${height}px`
              }}
              onMove={this.move}
            />
           )
        }
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(App)
