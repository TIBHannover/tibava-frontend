export default {
    methods: {
        get_display_time(seconds) {
            var h = Math.floor(seconds / 3600);
            var m = Math.floor((seconds % 3600) / 60);
            var s = Math.floor((seconds % 3600) % 60);
          
            var hDisplay = h > 0 ? h + (h == 1 ? " h " : " h ") : "";
            var mDisplay = m > 0 ? m + (m == 1 ? " min " : " min ") : "";
            var sDisplay = s > 0 ? s + (s == 1 ? " sec" : " sec") : "";
            return hDisplay + mDisplay + sDisplay;
        },
        get_timecode(seconds) {
            var h = Math.floor(seconds / 3600);
            var m = Math.floor((seconds % 3600) / 60);
            // var s = Math.round((seconds % 3600) % 60);
            var s = Math.floor((seconds % 3600) % 60);
            var ms = Math.round(1000 * (((seconds % 3600) % 60) % 1))
          
            const zeroPad = (num, places) => String(num).padStart(places, '0')
            // return zeroPad(h, 2) + ":" + zeroPad(m, 2) + ":" + zeroPad(s, 2) 
            return zeroPad(h, 2) + ":" + zeroPad(m, 2) + ":" + zeroPad(s, 2) + "." + zeroPad(ms, 3);
        }
    }
}
