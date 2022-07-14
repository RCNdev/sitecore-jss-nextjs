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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichText = void 0;
const react_1 = __importStar(require("react"));
const prop_types_1 = __importDefault(require("prop-types"));
const router_1 = require("next/router");
const sitecore_jss_react_1 = require("@sitecore-jss/sitecore-jss-react");
const prefetched = {};
const RichText = (props) => {
    const { internalLinksSelector = 'a[href^="/"]' } = props, rest = __rest(props, ["internalLinksSelector"]);
    const hasText = props.field && props.field.value;
    const isEditing = props.editable && props.field && props.field.editable;
    const router = router_1.useRouter();
    const richTextRef = react_1.useRef(null);
    react_1.useEffect(() => {
        // NOT IN EXPERIENCE EDITOR
        if (hasText && !isEditing) {
            initializeLinks();
        }
    }, []);
    const routeHandler = (ev) => {
        if (!ev.target)
            return;
        ev.preventDefault();
        const pathname = ev.target.pathname;
        router.push(pathname, pathname, { locale: false });
    };
    const initializeLinks = () => {
        const node = richTextRef.current;
        // selects all links that start with '/'
        const internalLinks = node && node.querySelectorAll(internalLinksSelector);
        if (!internalLinks || !internalLinks.length)
            return;
        internalLinks.forEach((link) => {
            if (!prefetched[link.pathname]) {
                router.prefetch(link.pathname, undefined, { locale: false });
                prefetched[link.pathname] = true;
            }
            link.addEventListener('click', routeHandler, false);
        });
    };
    return react_1.default.createElement(sitecore_jss_react_1.RichText, Object.assign({ ref: richTextRef }, rest));
};
exports.RichText = RichText;
exports.RichText.propTypes = Object.assign({ internalLinksSelector: prop_types_1.default.string }, sitecore_jss_react_1.RichTextPropTypes);
exports.RichText.defaultProps = {
    tag: 'div',
    editable: true,
};
exports.RichText.displayName = 'NextRichText';
