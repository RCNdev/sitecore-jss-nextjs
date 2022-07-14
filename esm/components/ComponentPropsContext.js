import React, { createContext, useContext } from 'react';
/**
 * Component props context which we are using in order to store data fetched on components level (getStaticProps/getServerSideProps)
 */
export const ComponentPropsReactContext = createContext({});
/**
 * Hook in order to get access to props related to specific component. Data comes from ComponentPropsContext.
 * @see ComponentPropsContext
 * @param {string | undefined} componentUid component uId
 * @returns {ComponentData | undefined} component props
 */
export function useComponentProps(componentUid) {
    if (!componentUid) {
        return undefined;
    }
    const data = useContext(ComponentPropsReactContext);
    return data[componentUid];
}
export const ComponentPropsContext = ({ children, value, }) => (React.createElement(ComponentPropsReactContext.Provider, { value: value }, children));
