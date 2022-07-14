"use strict";
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
exports.Link = void 0;
const react_1 = __importDefault(require("react"));
const prop_types_1 = __importDefault(require("prop-types"));
const link_1 = __importDefault(require("next/link"));
const sitecore_jss_react_1 = require("@sitecore-jss/sitecore-jss-react");
const Link = (props) => {
    const { editable, internalLinkMatcher = /^\//g, showLinkTextWithChildrenPresent } = props, htmlLinkProps = __rest(props, ["editable", "internalLinkMatcher", "showLinkTextWithChildrenPresent"]);
    const value = (props.field.href
        ? props.field
        : props.field.value);
    const { href } = value;
    const isEditing = editable && props.field.editable;
    if (href && !isEditing) {
        const text = showLinkTextWithChildrenPresent || !props.children ? value.text || value.href : null;
        // determine if a link is a route or not.
        if (internalLinkMatcher.test(href)) {
            return (react_1.default.createElement(link_1.default, { href: href, key: "link", locale: false },
                react_1.default.createElement("a", Object.assign({ title: value.title, target: value.target, className: value.class }, htmlLinkProps),
                    text,
                    props.children)));
        }
    }
    return react_1.default.createElement(sitecore_jss_react_1.Link, Object.assign({}, props));
};
exports.Link = Link;
exports.Link.defaultProps = {
    editable: true,
};
exports.Link.displayName = 'NextLink';
exports.Link.propTypes = Object.assign({ internalLinkMatcher: prop_types_1.default.instanceOf(RegExp) }, sitecore_jss_react_1.LinkPropTypes);
