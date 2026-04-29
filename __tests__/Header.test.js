import React from 'react';
import renderer from 'react-test-renderer';
import Header from '../src/components/Header';

test('Header renders correctly', () => {
  const tree = renderer.create(<Header title="Test" onBack={() => {}} />).toJSON();
  expect(tree).toMatchSnapshot();
});
