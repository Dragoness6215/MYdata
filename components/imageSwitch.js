import React, { useEffect, useState} from 'react';
import {Image,} from 'react-native';
import darkStyles from './darkStyles';
import lightStyles from './lightStyles.js'

// switches between the title logos depending on the selected style.
export default function ImageSwitch({styles}) {
  if(styles == darkStyles) {
    return (
      <Image style={styles.tinyLogo} source={require('../assets/TestLogoLight.png')}/>
    );
  }
  else {
    return(
      <Image style={styles.tinyLogo} source={require('../assets/TestLogo.png')}/>
    );
  }
}