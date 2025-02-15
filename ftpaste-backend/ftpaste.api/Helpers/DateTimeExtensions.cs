namespace FTPaste.Helpers
{
    public static class DateTimeExtensions
    {
        public static long ToUnixEpoch(this DateTime dateTime)
        {
            return ((DateTimeOffset)dateTime).ToUnixTimeSeconds();
        }

        public static DateTime FromUnixEpoch(this long unixTime)
        {
            return DateTimeOffset.FromUnixTimeSeconds(unixTime).UtcDateTime;
        }
    }
}
