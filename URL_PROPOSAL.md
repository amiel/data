# urlTemplate Proposal

## Summary

`urlTemplate` improves the extesibility of API endpoint urls in `RESTAdapter`.

## Motivation

I think that Ember Data has a reputation for being hard to configure. I've often
heard it recommended to design the server API around what Ember Data expects.
Considering a lot of thought has gone in to the default RESTAdapter API, this
is sound advice. However, this is a false and damaging reputation. The adapter
and serializer pattern that Ember Data uses makes it incredibly extensible. The
barrier of entry is high though, and it's not obvious how to get the url you need
unless it's [a namespace](http://emberjs.com/guides/models/connecting-to-an-http-server/#toc_url-prefix)
or something [pathForType](http://emberjs.com/guides/models/customizing-adapters/#toc_path-customization)
can handle. Otherwise it's "override `buildURL`". `RESTSerializer` was recently
improved to make handling various JSON structures easier; it's time for url
configuration to be easy too.

## Detailed Design

`buildURL` and associated methods and properties will be moved to a mixin design
to handle url generation only.

> More to come


## Drawbacks

* Building URLs in this way is likely to be less performant. If this proposal is
  generally accepted, I will run benchmarks.

## Alternatives

The main alternative that comes to mind, that would make it easier to configure
urls in the adapter, would be to generally simplify `buildURL` and create more
hooks.

## Unresolved Questions

* How many templates are reasonable? I'm starting with just `pathTemplate` to
  start with just the simplest case, but maybe there should be a
  `urlTemplate: "http://:host/:namespace/:path"`, and there could also be
  templates for different operations such as `findAll`, `findQuery`,
  `findHasMany`, `findBelongsTo`, etc.

