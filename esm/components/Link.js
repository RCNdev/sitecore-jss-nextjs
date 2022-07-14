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
import React from 'react';
import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { Link as ReactLink, LinkPropTypes, } from '@sitecore-jss/sitecore-jss-react';
export const Link = (props) => {
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
            return (React.createElement(NextLink, { href: href, key: "link", locale: false },
                React.createElement("a", Object.assign({ title: value.title, target: value.target, className: value.class }, htmlLinkProps),
                    text,
                    props.children)));
        }
    }
    return React.createElement(ReactLink, Object.assign({}, props));
};
Link.defaultProps = {
    editable: true,
};
Link.displayName = 'NextLink';
Link.propTypes = Object.assign({ internalLinkMatcher: PropTypes.instanceOf(RegExp) }, LinkPropTypes);
