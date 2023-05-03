import React from 'react'
import {Text,View} from 'react-native';

// This class permits the switching between various graph types.
export default function GraphSwitch({ active, children }) {
  // Switch all children and return the "active" one
  return (
    children.filter(child => child.props.name == active)
  )
}