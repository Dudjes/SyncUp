import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';

export default function App() {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome</Text>
      <TextInput
        placeholder='Enter your name'
        value={name}
        onChangeText={(text) => setName(text)}>
      </TextInput>
      <Text>Hello {name}</Text>

        <Button
          title={`Increase total: (${count})`}
        onPress={() => setCount(count + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});
