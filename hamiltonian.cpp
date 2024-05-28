#include <node_api.h>
#include <node.h>

void GetVariables(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();

    // Access the JavaScript variables here
    v8::Local<v8::Array> nodes = v8::Local<v8::Array>::Cast(args[0]);
    v8::Local<v8::Array> linkPairs = v8::Local<v8::Array>::Cast(args[1]);

    // Print the values
    for (unsigned int i = 0; i < nodes->Length(); i++) {
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        v8::Local<v8::Value> element = nodes->Get(context, i).ToLocalChecked();
        if (element->IsObject()) {
            v8::Local<v8::Object> node = v8::Local<v8::Object>::Cast(element);
            // rest of your code
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            v8::Local<v8::Value> key = v8::String::NewFromUtf8(isolate, "id").ToLocalChecked();
            v8::Local<v8::Value> value = node->Get(context, key).ToLocalChecked();
            v8::String::Utf8Value idStr(isolate, value);
            printf("Node %d: %s\n", i, *idStr);
        }
    }

    for (unsigned int i = 0; i < linkPairs->Length(); i++) {
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        v8::Local<v8::Value> element = linkPairs->Get(context, i).ToLocalChecked();
        if (element->IsObject()) {
            v8::Local<v8::Object> linkPair = v8::Local<v8::Object>::Cast(element);
            v8::Local<v8::Value> key = v8::String::NewFromUtf8(isolate, "id").ToLocalChecked();
            v8::Local<v8::Value> value = linkPair->Get(context, key).ToLocalChecked();
            v8::String::Utf8Value idStr(isolate, value);
            printf("Link Pair %d: %s\n", i, *idStr);
        }
    }

    // Return a value to JavaScript
    args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, "Done").ToLocalChecked());
}

void Initialize(v8::Local<v8::Object> exports) {
    NODE_SET_METHOD(exports, "getVariables", GetVariables);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)