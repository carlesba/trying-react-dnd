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

const DropShadow = ({...rest}) => <div {...rest} className='drop-area'>drop here</div>

const AreaShadow = ({connectDT, droppableAreaHeight, isOver}) => connectDT(
  <div style={{height: droppableAreaHeight}}>
    <CSSTransitions
      component='div'
      transitionName='grow'
      transitionAppear
      transitionEnterTimeout={100}
      transitionAppearTimeout={100}
      transitionLeaveTimeout={200}
    >
      {isOver &&
      <DropShadow style={{height: droppableAreaHeight}} />
      }
    </CSSTransitions>
  </div>
)
/**
 *
 */
class Block extends Component {
  shouldShowContent () {
    return !this.props.isDragging
  }
  shouldShowDropShadow () {
    return this.props.isOver
  }
  render () {
    const {
      connectDP,
      connectDS,
      connectDT,
      color,
      height,
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
          {this.shouldShowDropShadow() &&
          <DropShadow style={{height: droppableAreaHeight}} />
          }
        </CSSTransitions>
        {this.shouldShowContent() &&
          <div className='content' style={styles} />
        }
      </div>
      )))
  }
}

const dragSpec = {
  beginDrag (props, monitor, component) {
    return {
      blockRef: props.blockRef,
      initialDraggingHeight: findDOMNode(component).getBoundingClientRect().height
    }
  },
  endDrag (props, monitor) {
    if (monitor.didDrop()) {
      const {blockRef, onDrop} = monitor.getDropResult()
      onDrop(props.blockRef, blockRef)
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
  drop (props, monitor) {
    return {
      blockRef: props.blockRef,
      onDrop: props.onDrop
    }
  }
}
const dropConnect = (connect, monitor) => {
  const item = monitor.getItem() || {}
  return {
    connectDT: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    droppableAreaHeight: item.initialDraggingHeight
  }
}
const DroppableBlock = DropTarget('block', dropSpec, dropConnect)(DraggableBlock)

const DroppableArea = DropTarget('block', dropSpec, dropConnect)(AreaShadow)

class App extends Component {
  state = {
    list: initialState
  }
  addBlock = () => this.setState(({list}) => ({
    list: list.push(createBlock())
  }))
  getIndex = (targetRef) =>
    this.state.list.findIndex(({ref}) => ref === targetRef)
  move = (targetIndex, dropIndex) => {
    console.log('move', targetIndex, dropIndex)
    this.setState(({list}) => {
      const newList = list
          .deleteAt(targetIndex)
          .insertAt(dropIndex > targetIndex ? dropIndex - 1 : dropIndex, list[targetIndex])
      console.log('list::', newList.map(({ref}) => ref))
      return {
        list: newList,
        dragging: null
      }
    })
  }
  render () {
    return (
      <div>
        <button onClick={this.addBlock}>add</button>
        {this.state.list.map(({color, height, ref}) =>
          <DroppableBlock
            key={ref}
            blockRef={ref}
            color={color}
            height={`${height}px`}
            onDrop={(dragIndex, dropIndex) => this.move(
              this.getIndex(dragIndex),
              this.getIndex(dropIndex)
            )}
            />
           )
        }
        <DroppableArea
          onDrop={(targetRef) => {
            console.log('this.state.list.length', this.state.list.length)
            this.move(
              this.getIndex(targetRef),
              this.state.list.length
            )
          }}
        />
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(App)
