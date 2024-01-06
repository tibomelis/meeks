const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
    name: 'weather',
    short: '',
    description: 'Check the weather for any city/country',
    category: '',
    disabled: false,

    /**
     *
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args
     * @param {String} curPrefix
     */
    async execute(client, msg, args, curPrefix) {
        // https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
        var city = args.join(' ');
        var lang = 'en';
        var units = 'metric';
        var appid = '31dcbab5263b4b9939a2b2e58d10b322';

        fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${appid}&lang=${lang}&units=${units}`
        )
            .then((r) => r.json())
            .then(async (x) => {
                if (x?.cod == '404' || x?.message == 'city was not found')
                    return msg.channel.send(`${city} not found.`);

                var cur_weather = x.weather[0];
                var cur_wind = x.wind;

                var weather_embed = new Discord.EmbedBuilder();
                weather_embed.setTitle(`Weather in ${city}`);
                weather_embed.setColor('Blue');
                weather_embed.setDescription(
                    `${cur_weather.main} (${cur_weather.description})`
                );
                weather_embed.setFooter({
                    text: 'Weather provided by openweathermap.org',
                    iconURL:
                        'https://openweathermap.org/themes/openweathermap/assets/img/logo_white_cropped.png',
                });
                weather_embed.setTimestamp(Date.now());
                weather_embed.setImage(
                    `http://openweathermap.org/img/wn/${cur_weather.icon}.png`
                );
                weather_embed.addFields(
                    {
                        name: 'Wind Speed',
                        value: `${cur_wind.speed}m/s`,
                        inline: true,
                    },
                    {
                        name: 'Wind Direction',
                        value: `${cur_wind.deg}deg`,
                        inline: true,
                    },
                    {
                        name: 'Cloudiness',
                        value: `${x.clouds.all}%`,
                        inline: true,
                    },
                    {
                        name: 'Humidity',
                        value: `${x.main.humidity}%`,
                        inline: true,
                    },
                    {
                        name: 'Temperature',
                        value: `${x.main.temp}°C`,
                        inline: true,
                    },
                    {
                        name: 'Feels Like',
                        value: `${x.main.feels_like}°C`,
                        inline: true,
                    },
                    {
                        name: 'Minimum Temperature',
                        value: `${x.main.temp_min}°C`,
                        inline: true,
                    },
                    {
                        name: 'Maximum Temperature',
                        value: `${x.main.temp_max}°C`,
                        inline: true,
                    }
                );
                await msg.channel.send({ embeds: [weather_embed] });
                //     var weather_data = [
                //         {
                //             title: 'Pressure',
                //             value: JSONObj.main.pressure,
                //             measurement: 'mb',
                //         },
                //         {
                //             title: 'Humidity',
                //             value: JSONObj.main.humidity,
                //             measurement: '%',
                //         },
                //         {
                //             title: 'Weather',
                //             value: JSONObj.weather[0].main,
                //             measurement: '',
                //         },
                //         {
                //             title: 'Weather Description',
                //             value: JSONObj.weather[0].description,
                //             measurement: '',
                //         },
                //         {
                //             title: 'w_icon',
                //             value: JSONObj.weather[0].icon,
                //             measurement: '',
                //         },
                //         {
                //             title: 'Visibility',
                //             value: JSONObj.visibility,
                //             measurement: 'meter',
                //         },
                //         {
                //             title: 'Wind Speed',
                //             value: JSONObj.wind.speed,
                //             measurement: 'meters/hour',
                //         },
                //         {
                //             title: 'Wind Degrees',
                //             value: JSONObj.wind.speed,
                //             measurement: 'deg',
                //         },
                //         // { title: 'Rain', value: JSONObj.rain, measurement:'' },
                //         // { title: 'Clouds', value: JSONObj.clouds, measurement:'' },
                //     ];
                //     // return console.log(weather_data);

                //     var weather_embed = new Discord.EmbedBuilder();
                //     weather_embed.setTitle('Weather');
                //     weather_embed.setColor('Blue');

                //     for (var w_data of weather_data) {
                //         if (w_data.title == 'w_icon') {
                //             weather_embed.setThumbnail(
                //                 `http://openweathermap.org/img/wn/${w_data.value}.png`
                //             );
                //         } else {
                //             weather_embed.addFields({
                //                 name: w_data.name,
                //                 value: `${w_data.value}${w_data.measurement}`,
                //             });
                //         }
                //     }
                //     await msg.channel.send({ embeds: [weather_embed] });
            })
            .catch((err) => {
                return msg.channel.send(
                    `An error has occured:\n||${err}||`
                );
            });

        return;

        // var categories = [
        //     {
        //         category: 'Location',
        //         embed_color: 'DarkRed',
        //         category_data: [
        //             { name: 'Latitude', value: weatherData.coord.lat },
        //             { name: 'Longitude', value: weatherData.coord.lon },
        //         ],
        //     },
        //     {
        //         category: 'Temperature',
        //         embed_color: 'Orange',
        //         category_data: [
        //             { name: 'Temperature', value: weatherData.main.temp },
        //             { name: 'Feels like', value: weatherData.main.feels_like },
        //             { name: 'Minimum Temp', value: weatherData.main.temp_min },
        //             { name: 'Maximum Temp', value: weatherData.main.temp_max },
        //         ],
        //     },
        //     {
        //         category: 'Time',
        //         embed_color: 'White',
        //         category_data: [
        //             { name: 'Sunset', value: weatherData.sys.sunset },
        //             { name: 'Sunrise', value: weatherData.sys.sunrise },
        //             { name: 'Timezone', value: weatherData.timezone },
        //         ],
        //     },
        // ];
    },
};
