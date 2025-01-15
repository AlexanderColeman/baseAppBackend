import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
const ses = new SESClient({region: "us-east-2"});

function createSendEmialCommand(ToAddresses: string, fromAddress: string, message: string) {
    return new SendEmailCommand({
        Destination: {
            ToAddresses: [ToAddresses],
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: message,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Your one time password',
            },
        },
        Source: fromAddress,
    });
}

export async function sendEmail(email: string, token: string) {
    const command = createSendEmialCommand(email, 'acoleman22@yahoo.com', `Your one time password is: ${token}`);
    try {
        return await ses.send(command)
    } catch (error) {
        console.error('Error sending email:', error);
        return error;
    }
};