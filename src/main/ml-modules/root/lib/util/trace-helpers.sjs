module.exports = {
	getTraceHelpers(traceFlag) {
		const traceEnabled = xdmp.traceEnabled(traceFlag);

		const trace = traceEnabled
		  ? msg => { xdmp.trace(traceFlag, msg); }
		  : () => { /* no-op */ };
		const traceObject = traceEnabled
		  ? obj => { trace(xdmp.quote(obj)); }
		  : () => { /* no-op */ };

		return { trace, traceObject };
	},
};
