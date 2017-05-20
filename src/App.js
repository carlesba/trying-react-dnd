import React, { Component } from 'react'
import {findDOMNode} from 'react-dom'
import {deepFreeze as f} from 'freezr'
import HTML5Backend from 'react-dnd-html5-backend'
import CSSTransitions from 'react-addons-css-transition-group'
import {
  DragDropContext,
  DragSource,
  DropTarget
} from 'react-dnd'
import './App.css'

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
const initialState = f([
  createBlock(),
  createBlock(),
  createBlock(),
  createBlock(),
  createBlock()
])

const DroppableArea = ({...rest}) => <div {...rest} className='drop-area'>drop here</div>

/**
 *
 */
class Block extends Component {
  shouldShowContent () {
    return !this.props.isDragging
  }
  shouldShowDroppableArea () {
    return this.props.isOver
  }
  render () {
    const {
      connectDP,
      connectDS,
      connectDT,
      // isOver,
      // blockRef,
      // onMove,
      // canDrop,
      color,
      height,
      // isDragging,
      droppableAreaHeight
    } = this.props
    const styles = {
      backgroundColor: color,
      height: height
    }
    return connectDP(connectDS(connectDT(
      <div>
        <CSSTransitions
          component='div'
          transitionName='grow'
          transitionAppear
          transitionEnterTimeout={100}
          transitionAppearTimeout={100}
          transitionLeaveTimeout={200}
        >
          {this.shouldShowDroppableArea() &&
          <DroppableArea style={{height: droppableAreaHeight}} />
          }
        </CSSTransitions>
        {this.shouldShowContent() &&
          <div className='content' style={styles} />
        }
      </div>
      )))
  }
}

// class FirstPosition extends Component {
//   render () {
//     const {droppableAreaHeight, connectDT} = this.props
//     return connectDT(
//       <div>
//       <CSSTransitions
//         component='div'
//         style={{height: '20px'}}
//         transitionName='grow'
//         transitionAppear={true}
//         transitionEnterTimeout={100}
//         transitionAppearTimeout={100}
//         transitionLeaveTimeout={200}
//       >
//       {this.props.isOver &&
//         <DroppableArea style={{height: droppableAreaHeight}} />
//       }
//       </CSSTransitions>
//       </div>
//     )
//   }
// }

const dragSpec = {
  beginDrag (props, monitor, component) {
    // console.log('beginDrag', props.blockRef)

    return {
      blockRef: props.blockRef,
      initialDraggingHeight: findDOMNode(component).getBoundingClientRect().height
    }
  },
  endDrag (props, monitor) {
    if (monitor.didDrop()) {
      const {blockRef: dropRef} = monitor.getDropResult()
      props.onMove(props.blockRef, dropRef)
    }
  }
}
const dragConnect = (connect, monitor) => {
  return {
    connectDS: connect.dragSource(),
    connectDP: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}
const DraggableBlock = DragSource('block', dragSpec, dragConnect)(Block)

const dropSpec = {
  // hover (props, monitor, component) {
  //   console.log('hover', monitor.getItem().initialDraggingHeight)
  // },
  drop (props, monitor) {
    // console.log('drop', props.blockRef)
    return {
      blockRef: props.blockRef
    }
  }
}
const dropConnect = (connect, monitor) => {
  const item = monitor.getItem() || {}
  // const initialY = monitor.getInitialSourceClientOffset().y

  // const showDropArea = monitor.isOver()
  // console.log(
  //   monitor.getInitialClientOffset(),
  //   monitor.getInitialSourceClientOffset(),
  //   monitor.getClientOffset()
  // )
  return {
    connectDT: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    droppableAreaHeight: item.initialDraggingHeight
  }
}
const DroppableBlock = DropTarget('block', dropSpec, dropConnect)(DraggableBlock)

// const FirstPositionDroppable = DropTarget('block', dropSpec, dropConnect)(FirstPosition)

class App extends Component {
  state = {
    list: initialState
  }
  addBlock = () => this.setState(({list}) => ({
    list: list.push(createBlock())
  }))
  move = (dragRef, dropRef) => {
    const {list} = this.state
    console.log('list::', list.map(({ref}) => ref))
    console.log('move refs', dragRef, dropRef)
    const dragIndex = list.findIndex(({ref}) => ref === dragRef)
    const dropIndex = list.findIndex(({ref}) => ref === dropRef)
    // console.log('move index', dragIndex, dropIndex)
    this.setState(() => {
      const newList = list
          .deleteAt(dragIndex)
          .insertAt(dropIndex > dragIndex ? dropIndex - 1 : dropIndex, list[dragIndex])
      console.log('list::', newList.map(({ref}) => ref))
      return {
        list: newList,
        dragging: null
      }
    })
  }
  render () {
    // console.log(this.state.list, this.state.dragging)
    return (
      <div>
        <button onClick={this.addBlock}>add</button>
        {this.state.list.map(({color, height, ref}) =>
          <DroppableBlock
            key={ref}
            blockRef={ref}
            color={color}
            height={`${height}px`}
            onMove={this.move}
            />
           )
        }
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(App)
