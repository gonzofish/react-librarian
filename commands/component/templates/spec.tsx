import React from 'react';
import { shallow } from 'enzyme';

import { {{ tag }} } from '../{{ tag }}';

describe('Component: {{ tag }}', () => {
    test('should render without error', () => {
        expect(shallow(<{{ tag }} />).contains(<div>{{ tag }}</div>)).toBe(true);
    });
});
