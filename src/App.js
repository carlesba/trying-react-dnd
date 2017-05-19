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
    const {isOver, isDragging} = this.props
    const somebodyIsDragginOverMe = isOver && !isDragging
    // const meDragginOverSomeoneElse = isDragging && !isOver
    const noDragging = !isDragging && !isOver
    // return somebodyIsDragginOverMe || noDragging
    return true
  }
  shouldShowDroppableArea () {
    const {isOver, isDragging} = this.props
    const somebodyIsDragginOverMe = isOver && !isDragging
    const meDraggingOnMyself = isOver && isDragging
    return somebodyIsDragginOverMe || meDraggingOnMyself
  }
  render () {
    const {
      connectDP,
      connectDS,
      connectDT,
      isOver,
      blockRef,
      onMove,
      canDrop,
      color,
      height,
      isDragging,
      droppableAreaHeight,
      ...rest
    } = this.props
    const styles = {
      backgroundColor: color,
      height: height
    }
    return connectDP(connectDS(connectDT(
      <div>
        {this.shouldShowContent() &&
          <div className='content' style={styles} />
        }
        <CSSTransitions
          component='div'
          transitionName='grow'
          transitionAppear={true}
          transitionEnterTimeout={100}
          transitionAppearTimeout={100}
          transitionLeaveTimeout={200}
        >
        {this.shouldShowDroppableArea() &&
          <DroppableArea style={{height: droppableAreaHeight}} />
        }
        </CSSTransitions>
      </div>
      )))
  }
}

const DraggableBlock = DragSource(
  'block', 
  {
    beginDrag (props, monitor, component) {
      console.log('beginDrag', props.blockRef)

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
  },
  (connect, monitor) => {
    return {
      connectDS: connect.dragSource(),
      connectDP: connect.dragPreview(),
      isDragging: monitor.isDragging()
    }
  }
)(Block)
const DroppableBlock = DropTarget(
  'block',
  {
    hover (props, monitor, component) {
      console.log('hover', monitor.getItem().initialDraggingHeight)
    },
    drop (props, monitor) {
      // console.log('drop', props.blockRef)
      return {
        blockRef: props.blockRef
      }
    }
  },
  (connect, monitor) => {
    const item = monitor.getItem() || {}
    return {
      connectDT: connect.dropTarget(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      droppableAreaHeight: item.initialDraggingHeight
    }
  }
)(DraggableBlock)

class App extends Component {
  state = {
    list: initialState
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
