"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentPropsContext = exports.useComponentProps = exports.ComponentPropsReactContext = void 0;
const react_1 = __importStar(require("react"));
/**
 * Component props context which we are using in order to store data fetched on components level (getStaticProps/getServerSideProps)
 */
exports.ComponentPropsReactContext = react_1.createContext({});
/**
 * Hook in order to get access to props related to specific component. Data comes from ComponentPropsContext.
 * @see ComponentPropsContext
 * @param {string | undefined} componentUid component uId
 * @returns {ComponentData | undefined} component props
 */
function useComponentProps(componentUid) {
    if (!componentUid) {
        return undefined;
    }
    const data = react_1.useContext(exports.ComponentPropsReactContext);
    return data[componentUid];
}
exports.useComponentProps = useComponentProps;
const ComponentPropsContext = ({ children, value, }) => (react_1.default.createElement(exports.ComponentPropsReactContext.Provider, { value: value }, children));
exports.ComponentPropsContext = ComponentPropsContext;
